import { Command, END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import "@langchain/langgraph/zod";
import { runBasicAgent } from "./agents/workflow-agents/basic-agent.mts";
import { runToolAgent } from "./agents/workflow-agents/tool-agent.mts";
import { runReasoningAgent } from "./agents/workflow-agents/reasoning-agent.mts";
import { runMcpToolAgent } from "./agents/workflow-agents/mcp-tool-agent.mts";
import { runRoutingToolAgent } from "./agents/workflow-agents/routing-tool-agent.mts";

const workflowState = z.object({
    userInput: z.string(),
    basicAgentResponse: z.string(),
    toolAgentResponse: z.string(),
    reasoningAgentResponse: z.string(),
    mcpToolAgentResponse: z.string(),
    routingToolAgentResponse: z.array(z.string()).optional(),
    routingChoice: z.array(z.string()).optional(),
    catAgentResponse: z.string().optional(),
    dogAgentResponse: z.string().optional(),
    birdAgentResponse: z.string().optional(),
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

async function cat_agent(state: z.infer<typeof workflowState>) {
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
        catAgentResponse: response,
    };
}

async function dog_agent(state: z.infer<typeof workflowState>) {
    console.log("dog_agent");
    return {
        ...state,
        dogAgentResponse: "Dog agent executed successfully",
    };
}

async function bird_agent(state: z.infer<typeof workflowState>) {
    console.log("bird_agent");
    return {
        ...state,
        birdAgentResponse: "Bird agent executed successfully",
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

async function routingChoiceNode(state: z.infer<typeof workflowState>) {
    const response = await runRoutingToolAgent([
        {
            role: "system",
            content: "You are a routing agent that can route messages to the appropriate agent. Return the name of the agent to route the message to. If the message cannot be routed to any agent, return 'none'.",
        },
        {
            role: "user",
            content: state.userInput,
        },
    ]);
    return {
        ...state,
        routingChoice: response.agents
    };
}

async function routingToolAgentNode(state: z.infer<typeof workflowState>) {
    const response = await runRoutingToolAgent([
        {
            role: "system",
            content: "You are a routing agent that can route messages to the appropriate agent. Return the name of the agent to route the message to. If the message cannot be routed to any agent, return 'none'.",
        },
        {
            role: "user",
            content: state.userInput,
        },
    ]);
    state.routingChoice = response.agents;
    console.log(state.routingChoice);
    if (state.routingChoice.includes("none")) {
        return new Command({
            goto: END
        })
    }
    if (state.routingChoice.includes("cat_agent")) {
        return new Command({
            goto: "cat_agent"
        })
    }
    if (state.routingChoice.includes("dog_agent")) {
        return new Command({
            goto: "dog_agent"
        })
    }
    if (state.routingChoice.includes("bird_agent")) {
        return new Command({
            goto: "bird_agent"
        })
    }
    return {
        ...state,
        routingToolAgentResponse: response.agents,
        routingChoice: response.agents,
    };
}

const workflow = new StateGraph(workflowState)
    .addNode("cat_agent", cat_agent)
    .addNode("dog_agent", dog_agent)
    .addNode("bird_agent", bird_agent)
    .addNode("routing_tool_agent", routingToolAgentNode, {
        ends: ["cat_agent", "dog_agent", "bird_agent", END]
    })
    .addEdge(START, "routing_tool_agent")
    .compile();

const result = await workflow.invoke({
    userInput: "I want to know about cats",
});

console.log(result);