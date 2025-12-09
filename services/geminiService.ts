import { GoogleGenAI, Type } from "@google/genai";
import { PizzaSize, CrustType, SauceType, PizzaConfig, PizzaTopping } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface AISuggestion {
  name: string;
  description: string;
  size: PizzaSize;
  crust: CrustType;
  sauce: SauceType;
  toppings: string[]; // Names of toppings
  reasoning: string;
}

export const getCreativePizzaSuggestion = async (): Promise<AISuggestion | null> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Create a unique, delicious, and creative pizza configuration. It should be a valid pizza that someone would actually enjoy eating. Give it a catchy name.";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            size: { type: Type.STRING, enum: ["Small", "Medium", "Large"] },
            crust: { type: Type.STRING, enum: ["Thin", "Hand-Tossed", "Deep Dish", "Gluten-Free", "Stuffed", "Brooklyn Style"] },
            sauce: { type: Type.STRING, enum: ["Tomato", "Marinara", "BBQ", "Alfredo", "Garlic Parm", "Buffalo"] },
            toppings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of ingredients. Should be standard pizza toppings like Pepperoni, Bacon, Onions, Mushrooms, Peppers, Pineapple, Ham, Chicken, Olives, Sausage."
            },
            reasoning: { type: Type.STRING, description: "Why this combination works well together." }
          },
          required: ["name", "description", "size", "crust", "sauce", "toppings", "reasoning"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AISuggestion;
  } catch (error) {
    console.error("Error fetching suggestion from Gemini:", error);
    return null;
  }
};