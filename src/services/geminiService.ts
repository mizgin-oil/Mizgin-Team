
import { GoogleGenAI } from "@google/genai";
import { Employee, WorkLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeWorkEfficiency = async (logs: WorkLog[], user: Employee) => {
  if (!process.env.GEMINI_API_KEY) {
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
