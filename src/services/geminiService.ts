
import { GoogleGenAI } from "@google/genai";
import { Employee, WorkLog } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const analyzeWorkEfficiency = async (logs: WorkLog[], user: Employee) => {
  const ai = getAi();
  
  if (!ai) {
    return {
      summary: "AI analysis unavailable (API key missing).",
      totalHours: 0,
      insight: "Please configure your Gemini API key to see performance insights."
    };
  }

  try {
    const logsSummary = logs.map(l => ({
      checkIn: l.checkIn,
      checkOut: l.checkOut,
      duration: l.checkOut ? (new Date(l.checkOut).getTime() - new Date(l.checkIn).getTime()) / (1000 * 60 * 60) : 0
    }));

    const prompt = `Analyze the work efficiency for employee ${user.name} (${user.jobTitle}) based on these logs: ${JSON.stringify(logsSummary)}. Provide a summary, total hours, and a short motivational insight. Return the response in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      summary: "Error analyzing productivity.",
      totalHours: 0,
      insight: "We encountered an issue while processing your work patterns."
    };
  }
};
