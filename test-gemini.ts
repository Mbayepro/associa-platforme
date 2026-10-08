import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function testKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key found in .env");
    return;
  }
  
  console.log("Testing API Key starting with:", apiKey.substring(0, 5) + "...");
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Dis bonjour très brièvement.',
    });
    console.log("✅ SUCCESS! The key works. Response:", response.text);
  } catch (error: any) {
    console.log("❌ ERROR! The key failed to authenticate.");
    console.log(error.message);
  }
}

testKey();
