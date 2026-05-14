import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const chatService = {
  async sendMessage(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: "You are a helpful assistant for the 'Hassan Bus Hub' application. This app helps users in Hassan, Karnataka to track buses, find shared autos, and check crowd levels. You know about routes like H-01 (KSRTC to Hemavathi Nagar), H-05 (Old Bus Stand to Salagame Road), and H-08 (Dairy Circle to MCE). Be polite and informative." }]
          },
          ...history,
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
};
