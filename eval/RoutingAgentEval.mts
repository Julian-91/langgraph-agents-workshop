import { runRoutingToolAgent } from '../agents/workflow-agents/routing-tool-agent.mts';

const query = process.argv[2] || "I want to know about bears.";

try {
    // Format the messages as your function expects
    const messages = [
        {
            role: "system",
            content: "You are a routing agent that can route messages to the appropriate agent. Return the name or names of the agent to route the message to. If the message cannot be routed to any agent, return 'none'.",
        },
        {
            role: "user",
            content: query,
        },
    ];

    // Call your agent function
    const result = await runRoutingToolAgent(messages);

    // Output the result for promptfoo to capture
    console.log(result);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}