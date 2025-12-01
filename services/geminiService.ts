
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonData } from "../types";
import { storage } from "./storage";

const SYSTEM_INSTRUCTION = `
You are an expert Polish language tutor who teaches Russian-speaking students. 
Your goal is to assist the tutor by analyzing an audio recording of a lesson.

Analyze the provided audio (which contains a conversation in Polish and Russian).
Extract and generate the following in a structured JSON format:

1. **Summary**: A concise summary of what was discussed and learned in the lesson (in Russian).
2. **Vocabulary**: A list of key Polish words or phrases mentioned or struggled with, their Russian translations, and a short Polish example sentence for context.
3. **Mistakes**: Identify 3-5 key grammatical or pronunciation mistakes the student made. Show the incorrect phrase, the corrected version, and a brief explanation (in Russian).
4. **Exercises**: Generate 2 short homework exercises based strictly on the topics/words from this lesson.
5. **NextLessonIdeas**: Suggest 2-3 topics or activities for the next lesson based on the student's current gaps.

The output must be pure JSON.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Summary of the lesson in Russian." },
    vocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          polish: { type: Type.STRING },
          russian: { type: Type.STRING },
          example: { type: Type.STRING }
        }
      }
    },
    mistakes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          incorrect: { type: Type.STRING },
          correct: { type: Type.STRING },
          explanation: { type: Type.STRING }
        }
      }
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Type of exercise, e.g., 'Fill in blanks' or 'Translate'" },
          instruction: { type: Type.STRING, description: "Instruction in Russian" },
          questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    nextLessonIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["summary", "vocabulary", "mistakes", "exercises", "nextLessonIdeas"]
};

export const analyzeAudioLesson = async (base64Audio: string, mimeType: string): Promise<LessonData> => {
  const apiKey = storage.getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the Dashboard settings.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Please analyze this lesson recording and generate the lesson report."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      throw new Error("No response text generated");
    }

    const data = JSON.parse(response.text) as LessonData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
