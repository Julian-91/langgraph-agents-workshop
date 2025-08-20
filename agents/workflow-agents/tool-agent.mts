import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-5-mini",
    temperature: 1,
    apiKey: process.env.OPENAI_API_KEY,
});

export async function runToolAgent(messages: any) {
    const fetchCatFactTool = tool(
        async () => {
            const response = await fetch('https://catfact.ninja/fact')
            const data = await response.json()
            return `Cat fact: ${data.fact}`
        },
        {
            name: "get_cat_fact",
            description: "Get a random cat fact",
            schema: z.object({}),
        }
    )

    const agent = createReactAgent({
        llm: model,
        tools: [fetchCatFactTool],
    });

    const response = await agent.invoke({
        messages: [
            {
                role: "system",
                content: "You are a cat expert.",
            },

            {
                role: "user",
                content: "Tell me a cat fact."
            },
        ],
    });

    return response.messages[response.messages.length - 1].content;
}