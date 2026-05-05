const { Question, sequelize } = require('../src/models/Question');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function enrich() {
  try {
    const questions = await Question.findAll();
    console.log(`Found ${questions.length} questions to enrich.`);

    for (const q of questions) {
      console.log(`Enriching: ${q.title}...`);

      const prompt = `
        Generate a CONCISE Python boilerplate for the LeetCode problem: "${q.title}".
        Pattern: ${q.pattern}
        
        RULES:
        1. Minimalist code: Class Solution, function signature, and necessary imports.
        2. Provide base cases or initial state (e.g., dp = [0] * n).
        3. DO NOT write the critical/transition logic.
        4. Place "# TODO: Implement ${q.pattern} logic" comment in the critical section.
        5. No extra comments, no fluff.
        6. Return ONLY the code block.
      `;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const code = response.text().replace(/```python|```/g, '').trim();

        q.boilerplate = code;
        await q.save();
        console.log(`Successfully enriched ${q.title}`);
      } catch (err) {
        console.error(`Failed to enrich ${q.title}:`, err.message);
      }
    }

    console.log("All boilerplates enriched with concise Socratic stubs!");
    process.exit(0);
  } catch (error) {
    console.error("Enrichment failed:", error);
    process.exit(1);
  }
}

enrich();
