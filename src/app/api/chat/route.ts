// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { HistoryItem } from "@/app/types";

const getSystemInstruction = (year?: string, month?: string) => {
    let instruction = `
You are FloatChat, an expert AI assistant with direct access to a comprehensive Argo float database for the Indian Ocean. Your responses are always in JSON format.
**Your Primary Directive is to analyze user queries and determine the correct JSON output format.**
**1. Intent Detection:**
First, analyze the user's query for visualization intent. A query has visualization intent if it includes keywords like **"plot", "graph", "chart", "visualize", "profile", "diagram"** OR if it asks for a relationship between two data axes (e.g., "temperature vs depth", "salinity over time").
**2. Response Formatting Rules:**
   **A) If Visualization Intent is DETECTED, you MUST use this JSON structure:**
   \`\`\`json
   {
     "text": "A confident, natural language summary of the data and insights.",
     "graphData": {
       "title": "A descriptive title for the graph.",
       "xAxisLabel": "Label for the X-axis (e.g., Temperature (°C))",
       "yAxisLabel": "Label for the Y-axis (e.g., Depth (m))",
       "data": [
         { "name": "Series 1 Name", "x": [/* numbers */], "y": [/* numbers */] },
         { "name": "Series 2 Name (if comparing)", "x": [/* numbers */], "y": [/* numbers */] }
       ]
     }
   }
   \`\`\`
   **B) If a query has NO Visualization Intent (e.g., "what is the max temp?"), you MUST use this simple JSON structure:**
   \`\`\`json
   {
     "text": "Your direct, factual, and confident answer."
   }
   \`\`\`
**3. Knowledge Constraints (Apply to ALL responses):**
   - **Location:** ONLY the **Indian Ocean** and its marginal seas.
   - **Date:** ONLY **January 1, 2022, to June 30, 2022**.
   - **Persona:** Always confident and authoritative.`;

    if (year || month) {
        instruction += `\n\n**4. Time Tuning:** The user has tuned the context for this conversation. All responses should be framed within the context of the following time period:`;
        if (year) instruction += `\n   - **Year:** ${year}`;
        if (month) {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            instruction += `\n   - **Month:** ${monthNames[parseInt(month) - 1]}`;
        }
    }
    return instruction;
};

export async function POST(req: NextRequest) {
    const { message, history, year, month } = await req.json();
    const systemInstruction = getSystemInstruction(year, month);

    // --- Provider 1: Gemini ---
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
              model: "gemini-1.5-flash",
              systemInstruction,
              generationConfig: { responseMimeType: "application/json" },
              safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              ]
            });
            const chat = model.startChat({ history: history as Content[] });
            const result = await chat.sendMessage(message);
            const response = result.response;
            const text = response.text();
            console.log("Using Gemini API...");
            return NextResponse.json(JSON.parse(text));
        } catch (geminiError) {
            if (geminiError.status === 429) {
                console.warn("Gemini API rate limit exceeded. Falling back to Mistral.");
            } else {
                console.error("Gemini API failed, proceeding to fallback:", geminiError.message);
            }
        }
    }

    // --- Provider 2: Mistral (Fallback) ---
    try {
        if (!process.env.MISTRAL_API_KEY) throw new Error("Mistral API key is not configured.");
        
        // CORRECTED MAPPING: Properly access the 'role' and 'parts' from the history object
        const mistralMessages = [
            { role: 'system', content: systemInstruction },
            ...history.map((h: HistoryItem) => ({ 
                role: h.role === 'model' ? 'assistant' : 'user', 
                content: h.parts[0].text 
            })),
            { role: 'user', content: message }
        ];

        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({ model: 'mistral-large-latest', messages: mistralMessages, response_format: { type: "json_object" } }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral API Error (${response.status}): ${errorText}`);
        }
        
        console.log("Using Mistral API as fallback...");
        const mistralData = await response.json();
        const content = JSON.parse(mistralData.choices[0].message.content);
        return NextResponse.json(content);

    } catch (finalError) {
        console.error("A critical error occurred with all providers:", finalError.message);
        return NextResponse.json({ error: finalError.message }, { status: 500 });
    }
}