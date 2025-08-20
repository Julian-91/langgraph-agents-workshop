import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

dotenv.config();

const client = new MultiServerMCPClient({
    mcpServers: {
        "playwright": {
            "command": "npx",
            "args": [
                "@playwright/mcp@latest"
            ],
            "transport": "stdio"
        }
    }
});

const tool = await client.getTools();

const model = new ChatOpenAI({
    model: "gpt-5-mini",
    // temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
});

const agent = createReactAgent({
    llm: model,
    tools: tool,
});

const response = await agent.invoke({
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant that can answer questions and help with tasks.",
        },
        {
            role: "user",
            content: "Can you go google.com and search for Model context protocol? Click on the best result and tell me what the title is of the page?",
        },
    ],
});

await client.close();

console.log(response.messages[response.messages.length - 1].content);