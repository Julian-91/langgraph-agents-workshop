import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-5-mini",
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
});

const response = await model.invoke([
    {
        role: "system",
        content: "You are a helpful assistant that can answer questions and help with tasks.",
    },
    {
        role: "user",
        content: "What is 1+1?",
    },
]);

console.log(response.content);
