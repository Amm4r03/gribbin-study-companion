import { GoogleGenerativeAI } from '@google/generative-ai';
import { browser } from '$app/environment';

const CACHE_PREFIX = 'ai_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function getFromCache(key) {
    if (!browser) return null;
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
    }

    return data;
}

function saveToCache(key, data) {
    if (!browser) return;
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
}

export async function generateLearningRoadmap(syllabusText) {
    const cacheKey = `roadmap_${btoa(syllabusText.slice(0, 100))}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Based on the following course syllabus, create a detailed learning roadmap.
        Break down the content into logical modules, each with specific learning objectives and key concepts.
        For each key topic, suggest a relevant high-quality educational YouTube video or learning resource if applicable.

        Format the response as a JSON object with the following structure:
        {
            "modules": [
                {
                    "title": "Module title",
                    "description": "Brief description of the module",
                    "learningObjectives": ["objective 1", "objective 2", ...],
                    "keyTopics": ["topic 1", "topic 2", ...],
                    "resources": ["https://youtube.com/...", null, "https://youtube.com/...", ...],
                    "estimatedDuration": "X weeks",
                    "order": 1
                }
            ]
        }

        Important guidelines for resource suggestions:
        - Only include highly-rated educational content from reputable creators
        - Prefer comprehensive tutorial videos over short clips
        - Include resource URLs only if they directly explain the topic
        - Match resources array length with keyTopics array length
        - Use null for topics without a specific resource

        Syllabus:
        ${syllabusText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            const parsed = JSON.parse(text);
            saveToCache(cacheKey, parsed);
            return parsed;
        } catch (e) {
            throw new Error("Failed to parse AI response into valid JSON");
        }
    } catch (error) {
        console.error('Error generating roadmap:', error);
        
        // Return a basic fallback roadmap structure
        return {
            modules: [
                {
                    title: "Getting Started",
                    description: "Basic introduction to the course material",
                    learningObjectives: ["Understand course structure", "Identify key topics"],
                    keyTopics: syllabusText.split('\n')
                        .filter(line => line.trim())
                        .slice(0, 5)
                        .map(line => line.trim()),
                    resources: Array(5).fill(null),
                    estimatedDuration: "1-2 weeks",
                    order: 1
                }
            ]
        };
    }
}

export async function generateFlashcards(topic, content) {
    const cacheKey = `flashcards_${btoa(topic + content.slice(0, 100))}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Create a set of flashcards for studying ${topic} based on the following content:
        ${content}

        Format the response as a JSON array of flashcard objects:
        [
            {
                "front": "Question or concept",
                "back": "Answer or explanation",
                "difficulty": "easy|medium|hard"
            }
        ]

        Guidelines:
        - Create 5-10 flashcards
        - Vary the difficulty levels
        - Keep questions clear and concise
        - Include key concepts and definitions
        - Ensure answers are comprehensive but not too long
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const parsed = JSON.parse(text);
            saveToCache(cacheKey, parsed);
            return parsed;
        } catch (e) {
            throw new Error("Failed to parse AI response into valid JSON");
        }
    } catch (error) {
        console.error('Error generating flashcards:', error);

        // Return basic fallback flashcards
        return [
            {
                front: `What is ${topic}?`,
                back: "Review the content and create your own definition",
                difficulty: "medium"
            },
            {
                front: `List key components of ${topic}`,
                back: "Break down the content into main points",
                difficulty: "medium"
            }
        ];
    }
}