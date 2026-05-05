require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini(modelName = "gemini-1.5-flash") {
  console.log(`\n--- Testing Model: ${modelName} ---`);
  console.log(`API Key Found: ${process.env.GEMINI_API_KEY ? "Yes" : "No"}`);

  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY not found in .env file.");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    console.log("Sending test prompt: 'Write a short greeting for a coding assistant'...");
    const result = await model.generateContent("Write a short greeting for a coding assistant");
    const response = await result.response;
    const text = response.text();
    console.log("SUCCESS! Response from Gemini:");
    console.log("----------------------------");
    console.log(text);
    console.log("----------------------------");
  } catch (error) {
    console.error("FAILURE! Error details:");
    console.error(error.message);
    if (error.status) console.error(`Status: ${error.status}`);
  }
}

// Get model name from command line or use default
const args = process.argv.slice(2);
const modelToTest = args[0] || "gemini-1.5-flash";

testGemini(modelToTest);
