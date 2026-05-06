#!/usr/bin/env node

require('dotenv').config();

(async () => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🤖 Testing OpenRouter Agent SDK with callModel()');
    console.log('='.repeat(70) + '\n');

    // Import the agent SDK modules
    const { callModel, tool, stepCountIs } = await import('@openrouter/agent');
    const { OpenRouter } = await import('@openrouter/sdk');
    const { z } = await import('zod');

    console.log('✅ Imported @openrouter/agent, @openrouter/sdk, and zod\n');

    // Create OpenRouter client
    const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    console.log('✅ Created OpenRouter client\n');

    // Define a simple search tool
    const searchTool = tool({
      name: 'search',
      description: 'Search the web for information',
      inputSchema: z.object({
        query: z.string().describe('What to search for')
      }),
      outputSchema: z.object({
        results: z.string()
      }),
      execute: async ({ query }) => {
        console.log(`  📍 [TOOL EXECUTED] search("${query}")`);
        return { results: `Found articles about ${query}.` };
      }
    });

    // Define a simple calculator tool
    const calcTool = tool({
      name: 'calculate',
      description: 'Perform a simple calculation',
      inputSchema: z.object({
        operation: z.string().describe('e.g., "2+3" or "10*5"')
      }),
      outputSchema: z.object({
        result: z.string()
      }),
      execute: async ({ operation }) => {
        console.log(`  📍 [TOOL EXECUTED] calculate("${operation}")`);
        try {
          const result = eval(operation);
          return { result: `${operation} = ${result}` };
        } catch (e) {
          return { result: `Error: Invalid operation` };
        }
      }
    });

    console.log('✅ Defined tools: search, calculate\n');

    // Call the model with tools
    console.log('📤 Calling callModel() with tools...\n');

    const result = callModel(client, {
      model: 'openai/gpt-4o-mini',
      input: 'Search for information about dynamic programming and then calculate 5 times 7.',
      tools: [searchTool, calcTool],
      stopWhen: stepCountIs(5)
    });

    // Get the final text response
    const finalText = await result.getText();

    console.log('\n' + '='.repeat(70));
    console.log('✅ Agent loop completed!');
    console.log('='.repeat(70) + '\n');

    console.log('📝 Final Response:');
    console.log(finalText);
    console.log('\n' + '='.repeat(70));
    console.log('✨ Test passed!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
})();
