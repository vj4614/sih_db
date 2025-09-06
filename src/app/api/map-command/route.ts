// src/app/api/map-command/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemInstruction = `
You are an expert AI data filter. Your sole purpose is to parse a user's natural language query and convert it into a structured JSON object representing filter conditions for an Argo float database.

**Your Task:**
- Analyze the user's text to extract values for the following keys: \`region\`, \`startDate\`, \`endDate\`, \`project_name\`, and \`floatId\`.
- The user's query is for data ONLY within the **Indian Ocean** between **January 1, 2022, and June 30, 2022**.
- Infer dates correctly. "June" means June 2022. "Last week of January" means the last week of January 2022.
- If a value for a key is not mentioned in the query, you MUST return an empty string "" for that key.
- Your entire response MUST be a single, valid JSON object and nothing else.

**Valid Values:**
- \`region\`: "Indian Ocean", "Arabian Sea", "Bay of Bengal", "Andaman Sea", "Red Sea", "Java Sea", "Persian Gulf", "Sea of Zanj".
- \`project_name\`: "INCOIS", "NOAA", "CSIRO", "UKHO", "IFREMER", "BAS", "AWI", "PMEL", "JAMSTEC".
- \`startDate\`, \`endDate\`: "YYYY-MM-DD" format.
- \`floatId\`: A string of numbers.

**Example 1:**
- **User Query:** "Show all INCOIS floats in the Arabian Sea during June 2022"
- **Your Required JSON Response:**
  \`\`\`json
  {
    "region": "Arabian Sea",
    "startDate": "2022-06-01",
    "endDate": "2022-06-30",
    "project_name": "INCOIS",
    "floatId": ""
  }
  \`\`\`

**Example 2:**
- **User Query:** "Find float 98765"
- **Your Required JSON Response:**
  \`\`\`json
  {
    "region": "",
    "startDate": "",
    "endDate": "",
    "project_name": "",
    "floatId": "98765"
  }
  \`\`\`

**Example 3:**
- **User Query:** "What was happening in the first two weeks of February?"
- **Your Required JSON Response:**
  \`\`\`json
  {
    "region": "",
    "startDate": "2022-02-01",
    "endDate": "2022-02-14",
    "project_name": "",
    "floatId": ""
  }
  \`\`\`
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

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();
    if (!command) {
      throw new Error("No command provided.");
    }

    const result = await model.generateContent(command);
    const response = await result.response;
    const jsonText = response.text();

    return new NextResponse(jsonText, { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error processing AI map command:", error);
    return NextResponse.json(
      { error: "Failed to parse command. Please try rephrasing." },
      { status: 500 }
    );
  }
}