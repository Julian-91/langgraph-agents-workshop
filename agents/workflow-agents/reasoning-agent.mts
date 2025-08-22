import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-5-mini",
    temperature: 1,
    apiKey: process.env.OPENAI_API_KEY,
});


export async function runReasoningAgent(messages: any) {
    const agent = createReactAgent({
        llm: model,
        tools: []
    });

    const response = await agent.invoke(messages);
    return response.messages[response.messages.length - 1].content;
}
