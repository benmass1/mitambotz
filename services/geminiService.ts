
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { DiagnosisResult, GroundingSource } from "../types";

export const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const cleanAndParseJSON = (text: string) => {
  if (!text) throw new Error("Empty response text");
  try {
    const cleaned = text.replace(/^```json/, '').replace(/```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("Deep JSON Parse Error:", text);
        throw innerError;
      }
    }
    throw e;
  }
};

export const extractMachineDetails = async (base64Image: string, retries = 2) => {
  const ai = getAIClient();
  const imageData = base64Image.split(',')[1] || base64Image;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: imageData, mimeType: 'image/jpeg' } },
            { text: "Extract machine ID, make, name, and type from this nameplate. Return JSON object." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              make: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING }
            }
          }
        }
      });
      return cleanAndParseJSON(response.text);
    } catch (e) {
      if (attempt === retries) return null;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
};

export const getDetailedMachineSpecs = async (make: string, model: string) => {
  const ai = getAIClient();
  
  const prompt = `Provide official and extremely detailed technical data for: ${make} ${model}.
  I need "Saturated" information (Maelezo yaliyoshiba) for:
  1. INTERNAL SYSTEMS FLOW: Breakdown of Fuel System, Hydraulic System, Cooling System, and Powertrain. 
     For EACH system: List EVERY component from start to finish (flow) and provide a deep technical explanation in Swahili of how the system works from the first component to the last.
  2. SYSTEMS EDUCATION: Breakdown of Engine, Hydraulics, Electrical, Transmission.
  3. OPERATION & SYMBOLS: Critical dashboard symbols, maintenance tips, and operation rules.
  4. SPECIFICATIONS: Engine specs, lubricants, filters, and service intervals.
  
  USE PROFESSIONAL SWAHILI for all technical explanations. Ensure valid JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are Dr. Mitambo, a world-class heavy machinery master engineer. Provide saturated technical data in professional Swahili. When describing systems, be precise about component flow (start to finish). Return data strictly as valid JSON.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        maxOutputTokens: 12000, // Increased for saturated technical flow data
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            engine: { type: Type.STRING },
            transmission: { type: Type.STRING },
            differential: { type: Type.STRING },
            finalDrive: { type: Type.STRING },
            lubricants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  component: { type: Type.STRING },
                  type: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  specNumber: { type: Type.STRING }
                },
                required: ["component", "type", "quantity"]
              }
            },
            filters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["name", "quantity", "location"]
              }
            },
            internalSystemsFlow: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  systemName: { type: Type.STRING },
                  components: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING }
                },
                required: ["systemName", "components", "description"]
              }
            },
            systemsEducation: {
              type: Type.OBJECT,
              properties: {
                engineDetails: { type: Type.STRING },
                hydraulicDetails: { type: Type.STRING },
                electricalDetails: { type: Type.STRING },
                transmissionDetails: { type: Type.STRING },
                brakeSteeringDetails: { type: Type.STRING }
              }
            },
            operationGuide: {
              type: Type.OBJECT,
              properties: {
                symbolsAndAlerts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { symbol: { type: Type.STRING }, meaning: { type: Type.STRING } }
                  }
                },
                preventiveMaintenanceTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOperationRules: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            tyres: { type: Type.STRING },
            serviceSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { hours: { type: Type.STRING }, components: { type: Type.ARRAY, items: { type: Type.STRING } }, description: { type: Type.STRING } },
                required: ["hours", "components", "description"]
              }
            }
          },
          required: ["engine", "internalSystemsFlow", "systemsEducation", "operationGuide"]
        }
      }
    });

    const data = cleanAndParseJSON(response.text);
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) sources.push({ title: chunk.web.title || 'Ref', uri: chunk.web.uri });
      });
    }
    return { ...data, sources };
  } catch (e) {
    console.error("Machine specs fetch failed:", e);
    return null;
  }
};

export const analyzeSymptom = async (text: string, imageData?: string): Promise<string> => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Wewe ni Dr. Mitambo. Fanya uchunguzi wa kitaalam: ${text}. Jibu kwa Kiswahili.` }];
  if (imageData) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] || imageData } });
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts } });
  return response.text || "Samahani, nimeshindwa.";
};

export const generateMachineryImage = async (prompt: string, aspectRatio: string, size: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const editMachinePhoto = async (base64Image: string, editPrompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: 'image/jpeg' } },
        { text: editPrompt }
      ]
    }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const searchTechnicalData = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => { if (chunk.web?.uri) sources.push({ title: chunk.web.title || 'Ref', uri: chunk.web.uri }); });
  }
  return { text: response.text || "Hakuna taarifa.", sources };
};

export const findServiceCenters = async (lat: number, lng: number) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Authorized service centers nearby.",
    config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } }
  });
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => { if (chunk.maps?.uri) sources.push({ title: chunk.maps.title || 'Loc', uri: chunk.maps.uri }); });
  }
  return { text: response.text || "Hakuna sehemu.", sources };
};

export const generateTechnicalAnimation = async (prompt: string, startImage?: string) => {
  const ai = getAIClient();
  const payload: any = { model: 'veo-3.1-fast-generate-preview', prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } };
  if (startImage) payload.image = { imageBytes: startImage.split(',')[1] || startImage, mimeType: 'image/png' };
  let operation = await ai.models.generateVideos(payload);
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};
