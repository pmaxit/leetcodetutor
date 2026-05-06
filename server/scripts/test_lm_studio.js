const { OpenAI } = require("openai");
require('dotenv').config();

async function testOpenRouter() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 OpenRouter Connection Test");
  console.log("=".repeat(70) + "\n");

  const baseURL = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "google/gemma-3-4b-it";

  console.log("📋 Configuration:");
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   API Key: ${apiKey ? apiKey.substring(0, 20) + "..." : "NOT SET"}`);
  console.log(`   Model: ${model}\n`);

  if (!apiKey) {
    console.log("❌ ERROR: OPENROUTER_API_KEY not found in .env");
    console.log("\n💡 To fix:");
    console.log("  1. Get your API key from https://openrouter.ai");
    console.log("  2. Add to .env: OPENROUTER_API_KEY=sk-or-v1-...\n");
    process.exit(1);
  }

  // Test 1: Connection
  console.log("Test 1️⃣  Testing connection to OpenRouter...");
  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://ai-interview-platform.local',
        'X-Title': 'AI Interview Platform',
      },
    });

    const models = await client.models.list();
    console.log("✓ Connected to OpenRouter!");
    console.log(`  Available models (first 5): ${models.data.slice(0, 5).map(m => m.id).join(", ")}\n`);
  } catch (error) {
    console.log("✗ FAILED to connect to OpenRouter!");
    console.log(`  Error: ${error.message}`);
    console.log(`\n💡 Make sure:`);
    console.log(`  1. OPENROUTER_API_KEY is set correctly in .env`);
    console.log(`  2. Your API key has remaining credits at https://openrouter.ai`);
    console.log(`  3. You have internet connection\n`);
    process.exit(1);
  }

  // Test 2: Simple completion
  console.log("Test 2️⃣  Testing simple completion...");
  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://ai-interview-platform.local',
        'X-Title': 'AI Interview Platform',
      },
    });

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: "Say 'Hello' in one word.",
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const reply = response.choices[0].message.content;
    console.log("✓ Model responded successfully!");
    console.log(`  Response: "${reply}"\n`);
  } catch (error) {
    console.log("✗ FAILED to get completion from model!");
    console.log(`  Error: ${error.message}\n`);
    process.exit(1);
  }

  console.log("=".repeat(70));
  console.log("✅ All tests passed! OpenRouter is ready to use.");
  console.log("=".repeat(70) + "\n");

  console.log("🚀 Next steps:");
  console.log("  1. Start the interview server: npm start");
  console.log("  2. Open your browser and test an interview");
  console.log("  3. You should see Socratic hints before solutions\n");
}

testOpenRouter().catch(error => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
