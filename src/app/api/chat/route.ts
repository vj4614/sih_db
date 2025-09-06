// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemInstruction = `
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
   - For comparative queries, the "data" array MUST contain multiple objects, one for each series being compared.

   **B) If a query has NO Visualization Intent (e.g., "what is the max temp?"), you MUST use this simple JSON structure:**
   \`\`\`json
   {
     "text": "Your direct, factual, and confident answer."
   }
   \`\`\`

**3. Knowledge Constraints (Apply to ALL responses):**
   - **Location:** ONLY the **Indian Ocean** and its marginal seas.
   - **Date:** ONLY **January 1, 2022, to June 30, 2022**.
   - **Persona:** Always confident and authoritative.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
});

// Helper function to create a transform stream
function createStreamingTransform() {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    const chat = model.startChat({
        history: history as Content[],
    });

    const result = await chat.sendMessageStream(message);

    // Create a transform stream to pipe the response
    const transformStream = createStreamingTransform();
    const writer = transformStream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      for await (const chunk of result.stream) {
        writer.write(encoder.encode(chunk.text()));
      }
      writer.close();
    })();

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error("Error processing Gemini API request:", error);
    return new Response("Error processing the request.", { status: 500 });
  }
}