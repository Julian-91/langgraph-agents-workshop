import { runToolAgent } from '../agents/workflow-agents/tool-agent.mts';

const query = process.argv[2] || "I want to know about bears.";

try {
    // Format the messages as your function expects
    const messages = [
        {
            role: "system",
            content: "You are a cat expert."
        },
        {
            role: "user",
            content: query,
        },
    ];

    // Call your agent function
    const result = await runToolAgent(messages);

    // Output the result for promptfoo to capture
    console.log(result);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}