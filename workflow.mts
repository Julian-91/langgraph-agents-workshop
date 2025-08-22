import { END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { runBasicAgent } from "./agents/workflow-agents/basic-agent.mts";
import { runToolAgent } from "./agents/workflow-agents/tool-agent.mts";
import { runReasoningAgent } from "./agents/workflow-agents/reasoning-agent.mts";
import { runMcpToolAgent } from "./agents/workflow-agents/mcp-tool-agent.mts";

const workflowState = z.object({
    userInput: z.string(),
    basicAgentResponse: z.string(),
    toolAgentResponse: z.string(),
    reasoningAgentResponse: z.string(),
    mcpToolAgentResponse: z.string(),
});

async function basicAgentNode(state: z.infer<typeof workflowState>) {
    const response = await runBasicAgent([
        {
            role: "system",
            content: "You are a helpful assistant that can answer questions and help with tasks.",
        },
        {
            role: "user",
            content: state.userInput,
        },
    ]);
    return {
        ...state,
        basicAgentResponse: response,
    };
}

async function toolAgentNode(state: z.infer<typeof workflowState>) {
    const response = await runToolAgent([
        {
            role: "system",
            content: "You are a cat expert.",
        },

        {
            role: "user",
            content: "Tell me a cat fact."
        },
    ]);
    return {
        ...state,
        toolAgentResponse: response,
    };
}

async function reasoningAgentNode(state: z.infer<typeof workflowState>) {
    const response = await runReasoningAgent([
        {
            role: "system",
            content: "You are a helpful assistant that can answer questions and help with tasks.",
        },

        {
            role: "user",
            content: "What is 1+1?",
        },
    ]);
    return {
        ...state,
        reasoningAgentResponse: response,
    };
}

async function mcpToolAgentNode(state: z.infer<typeof workflowState>) {
    const response = await runMcpToolAgent([
        {
            role: "system",
            content: "You are a helpful assistant that can answer questions and help with tasks.",
        },
        {
            role: "user",
            content: "Can you go google.com and search for Model context protocol? Click on the best result and tell me what the title is of the page?",
        },
    ]);
    return {
        ...state,
        mcpToolAgentResponse: response,
    };
}

const workflow = new StateGraph(workflowState);

// Connect the nodes with edges (.addEdge)

const builder = workflow.compile();

const result = await builder.invoke({
    userInput: "What is 1+1?",
});

console.log(result);