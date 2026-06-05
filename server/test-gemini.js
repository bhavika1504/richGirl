import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

async function test() {
    if (!apiKey) {
        console.error('No API Key found in .env');
        return;
    }
    console.log('Testing with key length:', apiKey.length);

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-pro-latest';
    console.log(`\n--- Testing model: ${modelName} ---`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, respond with ONE word: SUCCESS");
        console.log('Response:', result.response.text());
        console.log(`Model ${modelName} works!`);
    } catch (err) {
        console.error(`Model ${modelName} failed.`);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        if (err.errorDetails) {
            console.error('Details:', JSON.stringify(err.errorDetails, null, 2));
        }
    }
}

test();
