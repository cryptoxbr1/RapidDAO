import { GoogleGenAI } from "@google/genai";

export const analyzeProposalWithAI = async (
  title: string,
  description: string
) => {
  try {
    // API Key must be obtained exclusively from process.env.API_KEY per guidelines
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API_KEY is missing. Please ensure the environment is configured correctly.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const prompt = `You are a professional DAO governance analyst. Summarize the proposal's impact and potential risks in exactly 2 concise sentences.
    
    Proposal Title: ${title}
    Proposal Description: ${description}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("No analysis generated.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};