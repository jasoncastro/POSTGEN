import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  try {
    const prompt = `Business Niche: Tech\nPlatform: Instagram\nCurrent Caption: Hello world\n\nProvide a new, fresh set of hashtags.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an SEO expert. Output JSON like {\"hashtags\": \"#1\"}",
        responseMimeType: "application/json",
      }
    });

    console.log("Success:", JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
