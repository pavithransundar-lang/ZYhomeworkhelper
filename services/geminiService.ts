import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = "You are a student's study assistant. A homework list is provided with each question for context. Use it to give specific advice, help prioritize tasks, and provide motivation. Keep your answers concise and encouraging.";

let chat: Chat | null = null;

const getChat = () => {
  if (!chat) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chat;
};


export const getInitialMessage = async (): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Start the conversation by gently reminding a student about their homework in a fun and supportive way. The student just opened their laptop.',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching initial message from Gemini:", error);
        return "Hey there! 👋 Just a friendly reminder to check on your homework. You've got this! What can I help you with today?";
    }
};


export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chatInstance = getChat();
    const response = await chatInstance.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw new Error("Failed to get a response from the AI.");
  }
};