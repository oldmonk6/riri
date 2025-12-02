import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const  getBodyPartImageFromGemini= async(analysis, reportText) =>{
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `
Generate a detailed image prompt only.

Goal: We want an magnified illustration of the body part specifically  focusing on: ${analysis.bodyPart} and label each part.
Requirements:
-add label to each and every part of affected body part
 -the image should clearly highlight the affected ${analysis.bodyPart}.
- Neutral medical-style 2D illustration.It should look like a medical textbook illustration.
- it should be detailed and anatomically accurate and label the body part which is damaged and show it full detailed each and every part of affected part .give me the magnified image of the affected part
- Use a soft red-to-yellow gradient overlay on the affected ${analysis.bodyPart} to indicate infection/inflammation.
- Background: plain white.
- let there be text and  labels, only the body and gradient highlight.

Return STRICT JSON:
{ "prompt": "<image prompt text>" }
`;

 const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const txt = response.text;
  console.log("hi")
   let cleaned = String(txt || '');

  // Remove common code fences (```json or ```)
  cleaned = cleaned.replace(/```(?:json)?\s*/ig, '').replace(/```/g, '');

  // Try to extract the first {...} JSON object block
  const objMatch = cleaned.match(/{[\s\S]*}/);
  if (!objMatch) {
    console.error('Could not find JSON object in model output:', cleaned.slice(0, 1000));
    throw new Error('Model did not return a JSON object. Raw output logged to server console.');
  }

  const jsonStr = objMatch[0];
  const imagePrompt = JSON.parse(jsonStr);
  console.log(imagePrompt);


  // Next: send imagePrompt to an image generation model (e.g., Gemini image endpoint or Google ImageFX if available)
  // This is pseudo – adjust to the real image generation API.
    const response2 = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: imagePrompt.prompt,
    });
    console.log(response2);
      const parts = response2.candidates[0].content.parts;
      console.log(parts);
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      return res.status(500).json({ error: "No image returned by Gemini" });
    }

    const imageBase64 = imagePart.inlineData.data; // <-- base64 string
    return { imageBase64 };

}