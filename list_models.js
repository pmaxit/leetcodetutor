require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  console.log("Listing available models...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // The SDK doesn't have a direct listModels method on the genAI instance
    // We have to use the REST API or check the documentation
    // But we can try to guess or use gemini-pro which is often the default
    console.log("Try to call a known model: gemini-pro");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Test");
    const response = await result.response;
    console.log("gemini-pro is AVAILABLE");
  } catch (error) {
    console.log("gemini-pro is NOT available:", error.message);
  }
}

listModels();
