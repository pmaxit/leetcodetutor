const { Question } = require('../src/models/Question');
const LLMService = require('../src/services/LLMService');
require('dotenv').config();

const CONCURRENCY = 4;

async function generateScaffold(question) {
  const prompt = `You are a technical content editor. I will provide you with a full Python solution for a coding problem.
Your task is to transform it into a "Practice Scaffold" (a skeleton).

Rules for the Scaffold:
1. It must contain the exact same class and method structure.
2. It must contain all necessary setup (imports, initializing variables, loops).
3. You MUST identify the "core algorithmic engine" (the "trick") and DELETE it.
4. Replace the deleted logic with a clear TODO comment:
   # TODO: [Briefly describe the missing core logic here]
5. The rest of the code should remain functional (e.g., if there's a loop, the loop should still exist).
6. Ensure the return statement is at the end.
7. ABSOLUTELY FORBIDDEN: Do not include any part of the solution's logic.

Problem: ${question.title}
Full Solution:
\`\`\`python
${question.python_code}
\`\`\`

Example Transformation (Two Sum):
Input:
\`\`\`python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []
\`\`\`
Output:
\`\`\`python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {} # val : index
        for i, n in enumerate(nums):
            # TODO: Find if the complement exists in prevMap and return the result
            prevMap[n] = i
        return []
\`\`\`

Return ONLY the transformed Python code block.`;

  try {
    const response = await LLMService.generateContent(prompt);
    // Extract code block
    const match = response.match(/```python\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/) || response.match(/class [\s\S]*/);
    let code = match ? (Array.isArray(match) ? match[match.length - 1] : match[0]) : response;
    code = code.replace(/```python\n|```/g, '').trim();
    return code;
  } catch (err) {
    console.error(`Error generating scaffold for ${question.title}:`, err);
    return null;
  }
}

async function processQuestion(q) {
  if (q.category === 'System Design') return;
  console.log(`Processing: ${q.title}...`);
  const scaffold = await generateScaffold(q);
  if (scaffold) {
    q.practice_scaffold = scaffold;
    await q.save();
    console.log(`✅ Updated: ${q.title}`);
  } else {
    console.log(`❌ Failed: ${q.title}`);
  }
}

async function run() {
  console.log('🚀 Starting scaffold generation (max 4 concurrent)...');
  const questions = await Question.findAll();
  const eligible = questions.filter(q => q.category !== 'System Design');
  console.log(`Found ${eligible.length} questions to process.`);

  // Promise pool: always keep up to CONCURRENCY tasks running
  const pool = new Set();
  let completed = 0;

  for (const q of eligible) {
    const p = processQuestion(q).finally(() => {
      pool.delete(p);
      completed++;
      console.log(`[${completed}/${eligible.length}] Task completed`);
    });
    pool.add(p);
    if (pool.size >= CONCURRENCY) await Promise.race(pool);
  }

  // Drain remaining tasks
  if (pool.size > 0) await Promise.all(pool);

  console.log('✨ Finished generating scaffolds!');
  process.exit(0);
}

run();
