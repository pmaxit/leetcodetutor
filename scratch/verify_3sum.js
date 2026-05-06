const { Question } = require('../server/src/models/Question');
const LLMService = require('../server/src/services/LLMService');
require('dotenv').config();

async function generateScaffold(question) {
  const prompt = `You are a technical content editor. I will provide you with a full Python solution for a coding problem.
Your task is to transform it into a "Practice Scaffold" (a skeleton).

Rules for the Scaffold (CRITICAL):
1. Keep the exact class and method signatures.
2. Keep all variable initializations that set up the algorithm (e.g., empty stacks, maps, pointers).
3. Keep the overall loop structure (for/while loops) if they define the traversal.
4. IDENTIFY the "core algorithmic engine" (the specific conditional logic or "the trick").
5. YOU MUST DELETE THE CORE LOGIC. Do not just add a comment; the actual code that solves the problem MUST be gone.
6. REPLACE the deleted logic with a clear, descriptive TODO comment:
   # TODO: [Briefly describe the missing core logic here]
7. STRICTLY FORBIDDEN: Do not include the solution logic. If your output contains the "if" statements or "calculations" that solve the problem, you have failed.
8. NEVER replace the entire function body with just "pass".
9. Ensure the return statement is at the end.
10. The scaffold must be runnable Python code (syntactically correct).

Problem: ${question.title}
Full Solution:
\`\`\`python
${question.python_code}
\`\`\`

Example 1 (Two Sum):
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
            # TODO: Check if the complement of 'n' exists in 'prevMap'. If so, return the indices.
            prevMap[n] = i
        return []
\`\`\`

Return ONLY the transformed Python code block.`;

  try {
    const response = await LLMService.generateContent(prompt);
    const match = response.match(/```python\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/) || response.match(/class [\s\S]*/);
    let code = match ? (Array.isArray(match) ? match[match.length - 1] : match[0]) : response;
    code = code.replace(/```python\n|```/g, '').trim();
    return code;
  } catch (err) {
    console.error(`Error generating scaffold for ${question.title}:`, err);
    return null;
  }
}

async function run() {
  const q = await Question.findOne({ where: { title: '3Sum' } }); // Use 3Sum as it's more complex
  if (q) {
    console.log(`Processing: ${q.title}...`);
    const scaffold = await generateScaffold(q);
    if (scaffold) {
      console.log('--- REGENERATED SCAFFOLD ---');
      console.log(scaffold);
      console.log('----------------------------');
    }
  }
  process.exit(0);
}

run();
