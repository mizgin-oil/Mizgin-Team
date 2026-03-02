
import { GoogleGenAI, Type } from "@google/genai";
import { WorkLog, Employee } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWorkEfficiency = async (logs: WorkLog[], employee: Employee) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these work logs for employee ${employee.name} (Job: ${employee.jobTitle}). 
      Logs: ${JSON.stringify(logs)}. 
      Provide a short, professional summary of their work hours and any suggestions for productivity in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            totalHours: { type: Type.NUMBER },
            insight: { type: Type.STRING }
          },
          required: ["summary", "totalHours", "insight"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};
