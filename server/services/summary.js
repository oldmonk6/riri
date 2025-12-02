
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const  getMedicalSummaryFromGemini=async (reportText) =>{
    console.log("hi")
   console.log(process.env.GEMINI_API_KEY);

 

  const prompt = `
You are a medical report assistant. Given this radiology / lab report text:

"${reportText}"

1. Identify what condition(s) the patient is likely suffering from in 2–3 simple sentences.
2. Explain possible cause(s) in 2–3 sentences.
3. Explain typical management / treatment options in layman terms in <= 6 bullets.
4. Identify which body part or region is most affected (single phrase, e.g. "left lower lung", "right knee joint").

IMPORTANT:
- Do NOT give definitive diagnosis.
- Always include a disclaimer that the user must consult a doctor and this is not medical advice.
- Output JSON with keys: condition, causes, treatmentAdvice, bodyPart, disclaimer.
`;

 const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log("hi");
  console.log(response)

  const text = response.text;
  console.log(text)

  // Models sometimes wrap JSON in markdown fences or add commentary.
  // Clean and extract the JSON object string robustly before parsing.
  let cleaned = String(text || '');

  // Remove common code fences (```json or ```)
  cleaned = cleaned.replace(/```(?:json)?\s*/ig, '').replace(/```/g, '');

  // Try to extract the first {...} JSON object block
  const objMatch = cleaned.match(/{[\s\S]*}/);
  if (!objMatch) {
    console.error('Could not find JSON object in model output:', cleaned.slice(0, 1000));
    throw new Error('Model did not return a JSON object. Raw output logged to server console.');
  }

  const jsonStr = objMatch[0];
  console.log( jsonStr);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to parse JSON from model output. Extracted string:', jsonStr);
    throw err;
  }
}
