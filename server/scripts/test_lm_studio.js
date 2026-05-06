const { OpenAI } = require("openai");
require('dotenv').config();

async function testLMStudio() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 LM Studio Connection Test");
  console.log("=".repeat(70) + "\n");

  const baseURL = process.env.LLM_BASE_URL || "http://localhost:1234/v1";
  const apiKey = process.env.LLM_API_KEY || "lm-studio";
  const model = process.env.LLM_MODEL || "google/gemma-3n-e4b";

  console.log("📋 Configuration:");
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   API Key: ${apiKey}`);
  console.log(`   Model: ${model}\n`);

  // Test 1: Connection
  console.log("Test 1️⃣  Testing connection to LM Studio...");
  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
    });

    const models = await client.models.list();
    console.log("✓ Connected to LM Studio!");
    console.log(`  Available models: ${models.data.map(m => m.id).join(", ")}\n`);
  } catch (error) {
    console.log("✗ FAILED to connect to LM Studio!");
    console.log(`  Error: ${error.message}`);
    console.log(`\n💡 Make sure:`);
    console.log(`  1. LM Studio is running`);
    console.log(`  2. Server is listening on ${baseURL}`);
    console.log(`  3. A model is loaded in LM Studio\n`);
    process.exit(1);
  }

  // Test 2: Simple completion
  console.log("Test 2️⃣  Testing simple completion...");
  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
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
  console.log("✅ All tests passed! LM Studio is ready to use.");
  console.log("=".repeat(70) + "\n");

  console.log("🚀 Next steps:");
  console.log("  1. Start the interview server: npm start");
  console.log("  2. Open your browser and test an interview");
  console.log("  3. You should see Socratic hints before solutions\n");
}

testLMStudio().catch(error => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
