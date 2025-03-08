import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Website context including PRD information
const WEBSITE_CONTEXT = `
Colossus.AI is an AI-powered Learning Guide System that generates visual learning roadmaps and knowledge graphs.
Key Features:
- AI-Powered Knowledge Graphs that process documents and create structured, interactive visual roadmaps
- Intelligent Search & Query feature for natural language document insights
- Visual Learning Paths that make complex topics easier to understand
- Document Processing and Analysis capabilities
- Interactive Knowledge Navigation

The system helps users easily navigate complex educational content through visual representations and AI-guided learning paths.

Team: Created by Team SE42 (Ruhan Nandalal, Chiran Senarath, Tharana Bopearachchi, Sudesh Seneviratne, Akila Senanayake, and Pasindu Gamage)
Contact: info.colossusai@gmail.com
`;

// System prompt for structured responses
const SYSTEM_PROMPT = `You are a helpful assistant for the Colossus.AI website. Use the following context to answer questions accurately and focus only on Colossus.AI related queries: ${WEBSITE_CONTEXT}

IMPORTANT RESPONSE GUIDELINES:
1. Keep responses simple, concise and easy to read
2. Use ONLY simple bullet points (with "-" symbol) for lists - DO NOT use any markdown formatting like "#" or "*"
3. Limit responses to 3-5 key points maximum
4. Use very short paragraphs (1-2 sentences maximum)
5. DO NOT use headings or subheadings with "#" symbols
6. Avoid technical jargon and complex explanations
7. Focus only on the most relevant information for the user's query
8. Use a friendly, conversational tone
9. If grouping information is needed, use simple text labels followed by bullet points
10. Keep the overall response under 150 words whenever possible`;

// Function to query DeepSeek API
async function queryDeepSeek(message: string): Promise<string> {
  try {
    console.log("Using DeepSeek API for chat completion");

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected DeepSeek API response format:", data);
      throw new Error("Unexpected response format from DeepSeek API");
    }

    return (
      data.choices[0].message.content ||
      "I apologize, but I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Error querying DeepSeek:", error);
    throw error;
  }
}

// Function to query OpenAI
async function queryOpenAI(message: string): Promise<string> {
  try {
    console.log("Using OpenAI API for chat completion");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return (
      completion.choices[0].message.content ||
      "I apologize, but I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Error querying OpenAI:", error);
    throw error;
  }
}

// Function to query Anthropics API
async function queryAnthropics(message: string): Promise<string> {
  try {
    console.log("Using Anthropics API for chat completion");

    const model = "claude-3-7-sonnet-latest"; // Use the latest model

    const response = await fetch(
      "https://api.anthropic.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ANTHROPICS_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Anthropics API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Anthropics API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected Anthropics API response format:", data);
      throw new Error("Unexpected response format from Anthropics API");
    }

    return (
      data.choices[0].message.content ||
      "I apologize, but I couldn't generate a response. Please try again."
    );
  } catch (error) {
    console.error("Error querying Anthropics:", error);
    throw error;
  }
}

async function queryLLM(message: string): Promise<string> {
  // Get the current LLM provider from environment variable
  const currentProvider = process.env.CURRENT_LLM_PROVIDER || "deepseek"; // Force Anthropics for Colossus.AI
  console.log(`Using LLM provider: ${currentProvider}`);

  try {
    if (currentProvider.toLowerCase() === "deepseek") {
      return await queryDeepSeek(message);
    } else if (currentProvider.toLowerCase() === "anthropics") {
      return await queryAnthropics(message);
    } else {
      return await queryOpenAI(message);
    }
  } catch (error) {
    console.error("Error querying LLM:", error);
    return "I'm unable to answer that question. Please contact us at info@colossusai.net for more information.";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await queryLLM(message);

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        success: false,
        response:
          "I'm unable to answer that question. Please contact us at info@colossusai.net for more information.",
      },
      { status: 500 }
    );
  }
}
