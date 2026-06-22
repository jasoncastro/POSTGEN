import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate", async (req, res) => {
    try {
      const { niche, platform, contentType, rawDraft, promo, brandVoice, generateVideoScript, language, seoKeywords } = req.body;
      
      const systemInstruction = `You are an elite Social Media Manager and SEO Copywriter specializing in visual arts, design, and small local businesses. Your job is to take the user's raw, unpolished text draft and transform it into a highly engaging, SEO-optimized masterpiece. You must adapt the final output based on the Target Platform, Content Type, and the specific Business Niche, while staying true to the core message of the user's original draft. ### ADAPTATION RULES: **1. Tone & Brand Voice (Crucial for Creators/Small Businesses):** * The user will provide a specific Brand Voice preference. You MUST ensure the generated copy embodies this tone perfectly (e.g. Playful, Authoritative, Minimalist, Energetic, Authentic). * Do not sound like a corporate robot. The tone should be passionate and professional, adopting the requested Brand Voice. * Elevate the vocabulary to sound authoritative in their niche. **2. Call-to-Action (Crucial):** * You MUST include an effective, compelling Call-to-Action (CTA) that actively attracts the client/reader to book an appointment, pay a downpayment to secure their schedule, or claim limited offers/promos (incorporate the user's Special Promo/Offer if provided). **3. By Content Type:** * **Image:** Focus on visual storytelling. Expand on the user's draft by describing the "vibe" or effort behind the work. End with the strong CTA. * **Short Video (Reels/TikTok/Shorts):** Strip the fluff. The first line must be a massive hook. Use the user's draft to create a punchy, fast-paced caption that keeps people watching. * **Long Video (YouTube/Facebook Watch):** Expand the user's draft into a rich, SEO-heavy description. Include a structured overview, searchable keywords, and natural spaces for timestamps or portfolio links. **4. SEO Keywords Integration:** * Ensure that any provided SEO Keywords are naturally integrated into the final caption output. **5. By Target Platform:** * **Facebook & WhatsApp & Threads:** Conversational and community-driven. Focus on building trust with local clients. * **Instagram:** Aesthetic and highly visual. Use strategic line breaks, relevant emojis, and focus heavily on aesthetics and lifestyle. * **TikTok:** Raw, trendy, and native. Very conversational, focusing on the "behind-the-scenes" or the process. * **X (Twitter):** Concisely punchy, engaging, emphasizing quick thoughts and leveraging threads if necessary. * **YouTube:** Highly structured. The first two lines must summarize the user's draft perfectly before the "Show More" fold. ### OUTPUT FORMAT: You MUST return a JSON object with the exact following schema AND translate your entire response (except JSON keys) to the requested Content Language:
      {
        "optimizedTitles": ["title 1", "title 2", "title 3"],
        "polishedCaption": "The full polished string...",
        "hashtags": "#tag1 #tag2 ...",
        "trendingPosts": [{"title": "Post idea", "description": "Why it works"}]${generateVideoScript ? ',\n        "videoScript": "The script for the video hook, body, and CTA..."' : ''}
      }`;

      const prompt = `Content Language: ${language || 'English'}\nBusiness Niche: ${niche}\nBrand Voice: ${brandVoice || 'Authentic'}\nPlatform: ${platform}\nContent Type: ${contentType}\nSEO Target Keywords: ${seoKeywords || 'None'}\nSpecial Promo/Offer: ${promo || 'None'}\nRaw Draft: ${rawDraft}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const parsedJSON = JSON.parse(response.text || "{}");
      res.json({ result: parsedJSON });
    } catch (error) {
      console.error(error);
      let errorMessage = "An error occurred while generating the copy.";
      if (error?.status === 429 || (error as any)?.message?.includes("429") || (error as any)?.message?.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "API Rate limit exceeded (Free Tier). Please wait a bit before trying again.";
      }
      res.status((error as any)?.status === 429 ? 429 : 500).json({ error: errorMessage });
    }
  });

  app.post("/api/generate-hashtags", async (req, res) => {
    try {
      const { niche, platform, polishedCaption } = req.body;
      
      const systemInstruction = `You are an SEO and Social Media Expert. Your task is to generate 10-15 high-performing, trending, and niche-specific hashtags for a given social media post. Use a mix of broad industry tags, niche specific tags, and local tags if applicable.
### OUTPUT FORMAT:
You MUST return a JSON object with the exact following schema:
{
  "hashtags": "#Trending #Hashtags #SpaceSeparated..."
}`;

      const prompt = `Business Niche: ${niche}\nPlatform: ${platform}\nCurrent Caption: ${polishedCaption}\n\nProvide a new, fresh set of hashtags.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const parsedJSON = JSON.parse(response.text || "{}");
      res.json({ result: parsedJSON });
    } catch (error) {
      console.error(error);
      let errorMessage = "An error occurred while generating hashtags.";
      if (error?.status === 429 || (error as any)?.message?.includes("429") || (error as any)?.message?.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "API Rate limit exceeded. Please wait a bit before trying again.";
      }
      res.status((error as any)?.status === 429 ? 429 : 500).json({ error: errorMessage });
    }
  });

  app.post("/api/suggest-keywords", async (req, res) => {
    try {
      const { niche } = req.body;
      const systemInstruction = `You are an SEO expert. Given a business niche, provide exactly 5 high-ranking SEO keywords or short phrases. Return ONLY a JSON object with this schema: { "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"] }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Business Niche: ${niche}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const parsedJSON = JSON.parse(response.text || "{}");
      res.json({ result: parsedJSON.keywords || [] });
    } catch (error) {
      console.error(error);
      let errorMessage = "An error occurred while suggesting keywords.";
      if (error?.status === 429 || (error as any)?.message?.includes("429") || (error as any)?.message?.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "API Rate limit exceeded. Please wait a bit before trying again.";
      }
      res.status((error as any)?.status === 429 ? 429 : 500).json({ error: errorMessage });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
