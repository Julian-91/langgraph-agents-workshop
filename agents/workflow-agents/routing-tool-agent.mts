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

const routingToolAgentSchema = z.object({
    agents: z.array(z.string()).describe("The name or names of the agent to route the message to. If the message cannot be routed to any agent, return 'none'."),
});


export async function runRoutingToolAgent(messages: any) {
    const getAvailableAgentsTool = tool(
        async () => {
            const agents = [
                {
                    name: "cat_agent",
                    description: "A cat agent that can answer questions about cats.",
                },
                {
                    name: "dog_agent",
                    description: "A dog agent that can answer questions about dogs.",
                },

                {
                    name: "bird_agent",
                    description: "A bird agent that can answer questions about birds.",
                },
            ]
            return JSON.stringify(agents, null, 2);
        },
        {
            name: "get_available_agents",
            description: "Get a list of available agents",
            schema: z.object({}),
        }
    )

    const agent = createReactAgent({
        llm: model,
        tools: [getAvailableAgentsTool],
        responseFormat: routingToolAgentSchema,
    });

    const response = await agent.invoke({ messages });

    return response.structuredResponse.agents;
}