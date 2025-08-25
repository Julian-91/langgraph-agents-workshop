import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY,
});

export async function runMcpToolAgent(messages: any) {
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

    const agent = createReactAgent({
        llm: model,
        tools: tool
    });

    const response = await agent.invoke({ messages });

    await client.close();

    return response.messages[response.messages.length - 1].content;
}