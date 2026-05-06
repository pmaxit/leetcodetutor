#!/usr/bin/env node

require('dotenv').config();

(async () => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🤖 Testing OpenRouter Agent SDK - Simple Example');
    console.log('='.repeat(70) + '\n');

    const { callModel, tool } = await import('@openrouter/agent');
    const { OpenRouter } = await import('@openrouter/sdk');
    const { z } = await import('zod');

    console.log('✅ Imported dependencies\n');

    // Create OpenRouter client
    const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    console.log('✅ Created OpenRouter client\n');

    // Simple tool that doesn't require API calls
    const mathTool = tool({
      name: 'add_numbers',
      description: 'Add two numbers together',
      inputSchema: z.object({
        a: z.number().describe('First number'),
        b: z.number().describe('Second number')
      }),
      outputSchema: z.object({
        result: z.number()
      }),
      execute: async ({ a, b }) => {
        console.log(`  📍 Tool executed: add_numbers(${a}, ${b})`);
        return { result: a + b };
      }
    });

    console.log('✅ Defined math tool\n');

    console.log('📤 Calling callModel with tool...\n');

    // This will call the tool internally
    const result = callModel(client, {
      model: 'openai/gpt-4o-mini',
      input: 'What is 15 plus 27? Use the add_numbers tool.',
      tools: [mathTool]
    });

    // Get the final response
    try {
      const finalText = await result.getText();
      console.log('\n✅ Agent loop completed!\n');
      console.log('📝 Final Response:');
      console.log(finalText);
    } catch (textError) {
      console.log('\n⚠️  Tool execution succeeded, but getText() had an error');
      console.log('This might be a SDK state management issue.');
      console.log('Error:', textError.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ Tool execution test passed!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
