const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Question } = require('../src/models/Question');
const llmService = require('../src/services/LLMService');

/**
 * LeetCode Problem Scraper
 * Scrapes problem details including description, examples, constraints, etc.
 *
 * WARNING: This violates LeetCode's ToS. Use only for personal/educational purposes.
 *
 * Usage: node server/scripts/scrape-leetcode.js <slug> [slug2] [slug3]...
 * Example: node server/scripts/scrape-leetcode.js two-sum add-two-numbers
 */

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// LeetCode GraphQL query for problem details - Using standard 'questionData' operation
const PROBLEM_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      sampleTestCase
      exampleTestcases
      exampleTestcaseList
      hints
      codeSnippets {
        lang
        langSlug
        code
      }
    }
  }
`;

// LeetCode GraphQL query for listing all problems
const ALL_PROBLEMS_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        titleSlug
      }
    }
  }
`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchProblemViaGraphQL(titleSlug) {
  try {
    console.log(`📡 Fetching ${titleSlug} via GraphQL...`);

    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        operationName: 'questionData',
        query: PROBLEM_QUERY,
        variables: { titleSlug }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://leetcode.com',
          'Origin': 'https://leetcode.com'
        },
        timeout: 10000
      }
    );

    if (response.data.errors) {
      console.error(`❌ GraphQL Error for ${titleSlug}:`, JSON.stringify(response.data.errors));
      return null;
    }

    const problem = response.data.data.question;
    if (!problem) {
      console.error(`❌ Problem not found: ${titleSlug}`);
      return null;
    }

    console.log(`✅ Successfully fetched: ${problem.title}`);
    return problem;
  } catch (error) {
    if (error.response) {
      console.error(`❌ Error fetching ${titleSlug}: Status ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`❌ Error fetching ${titleSlug}: ${error.message}`);
    }
    return null;
  }
}

async function fetchAllProblemSlugs() {
  try {
    console.log(`📡 Fetching list of all problems...`);
    const limit = 100;
    let skip = 0;
    let allSlugs = [];
    let hasMore = true;

    while (hasMore) {
      console.log(`   📥 Fetching problems ${skip} to ${skip + limit}...`);
      const response = await axios.post(
        LEETCODE_GRAPHQL_URL,
        {
          operationName: 'problemsetQuestionList',
          query: ALL_PROBLEMS_QUERY,
          variables: {
            categorySlug: "all-code-essentials",
            limit: limit,
            skip: skip,
            filters: {}
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        }
      );

      const data = response.data.data.problemsetQuestionList;
      const slugs = data.questions.map(q => q.titleSlug);
      allSlugs = allSlugs.concat(slugs);
      
      console.log(`   ✅ Found ${allSlugs.length} / ${data.total} problems`);
      
      if (allSlugs.length >= data.total || slugs.length === 0) {
        hasMore = false;
      } else {
        skip += limit;
        await sleep(500); // Be nice to the API
      }
    }

    return allSlugs;
  } catch (error) {
    console.error(`❌ Error fetching problem list:`, error.message);
    return [];
  }
}

async function saveImagesToLocal(htmlContent, problemTitle) {
  const imageDir = path.join(__dirname, '../../server/public/leetcode-images');

  // Create directory if it doesn't exist
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Find all image URLs in the HTML
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match;
  const images = [];

  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (url.includes('leetcode') || url.includes('assets')) {
      images.push(url);
    }
  }

  // Download images (with rate limiting)
  for (const imageUrl of images) {
    try {
      const filename = path.basename(new URL(imageUrl).pathname) || `image-${Date.now()}.png`;
      const filepath = path.join(imageDir, filename);

      if (!fs.existsSync(filepath)) {
        console.log(`   📥 Downloading image: ${filename}`);
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 5000
        });
        fs.writeFileSync(filepath, response.data);
      }
    } catch (err) {
      console.warn(`   ⚠️ Failed to download image: ${imageUrl}`);
    }
  }

  // Replace image URLs with local paths
  let modifiedHtml = htmlContent;
  images.forEach(url => {
    const filename = path.basename(new URL(url).pathname);
    modifiedHtml = modifiedHtml.replace(url, `/leetcode-images/${filename}`);
  });

  return modifiedHtml;
}

function parseExamples(htmlContent) {
  // Extract example blocks from HTML
  // This is a simple parser - LeetCode's HTML structure varies
  const exampleBlocks = [];
  const exampleRegex = /<strong[^>]*>Example\s+(\d+):<\/strong>[\s\S]*?(?=<strong|<p|$)/gi;

  let match;
  while ((match = exampleRegex.exec(htmlContent)) !== null) {
    exampleBlocks.push({
      number: parseInt(match[1]),
      html: match[0]
    });
  }

  return exampleBlocks;
}

async function enrichWithLLM(problem) {
  const prompt = `
    You are a Technical Content Engineer. Transform this raw LeetCode problem data into a high-quality, structured format for an AI Interview Platform.
    
    Problem: ${problem.title}
    Difficulty: ${problem.difficulty}
    Raw Content (HTML): 
    ${problem.content}
    
    Metadata/Tags: ${problem.metaData}
    
    TASK:
    1. Convert the HTML content to clean, beautiful Markdown.
    2. Identify the core algorithmic pattern (e.g., "Two Pointers", "Dynamic Programming", "Sliding Window").
    3. Extract exactly 3 Socratic hints that guide a student without giving the answer.
    4. Provide a clean Python3 boilerplate.
    5. Generate 2-3 "Solution Approaches" (e.g. Brute Force vs Optimal) with time/space complexity analysis.
    
    OUTPUT FORMAT (JSON ONLY):
    {
      "description": "Clean Markdown here",
      "pattern": "Core Pattern here",
      "hints": ["Hint 1", "Hint 2", "Hint 3"],
      "boilerplate": "def solve(...):\\n    pass",
      "solution_approaches": [
        { "name": "Approach Name", "description": "...", "complexity": "O(N) time, O(1) space" }
      ]
    }
    
    RULES:
    - No LaTeX. Use $...$ only if absolutely necessary for complexity.
    - Be concise but thorough.
    - Return ONLY valid JSON.
  `;

  try {
    const response = await llmService.generateContent(prompt);
    // Remove markdown code blocks if present
    let cleaned = response.replace(/```json|```/g, '').trim();
    
    // Extract everything between first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      // Try using the fixJsonEscaping method from LLMService
      const fixed = llmService.fixJsonEscaping(cleaned);
      return JSON.parse(fixed);
    } catch (innerErr) {
      // Fallback to raw if fix fails
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error(`   ⚠️ LLM Enrichment failed for ${problem.title}:`, error.message);
    return null;
  }
}

async function processProblem(titleSlug) {
  const problem = await fetchProblemViaGraphQL(titleSlug);

  if (!problem) {
    return null;
  }

  // Enrichment step using LLM (LM Studio)
  console.log(`   🧠 Enriching ${problem.title} using LLM...`);
  const enriched = await enrichWithLLM(problem);

  // Find Python code snippet
  const pythonSnippet = problem.codeSnippets?.find(s => s.langSlug === 'python3');
  const pythonCode = pythonSnippet?.code || '# Solution code';

  // Process images
  let processedContent = enriched?.description || problem.content;
  if (problem.content && problem.content.includes('img')) {
    processedContent = await saveImagesToLocal(processedContent, problem.title);
  }

  const examples = parseExamples(problem.content);
  
  // Extract test cases from LeetCode data
  const testCases = problem.exampleTestcaseList || (problem.jsonExampleTestcases ? JSON.parse(problem.jsonExampleTestcases) : []);
  const sampleTestCase = problem.sampleTestCase || "";

  const questionData = {
    title: problem.title,
    description: processedContent,
    pattern: enriched?.pattern || 'LeetCode DSA',
    category: enriched?.pattern || 'LeetCode DSA',
    difficulty: problem.difficulty,
    boilerplate: enriched?.boilerplate || `def ${problem.titleSlug.replace(/-/g, '_')}(${extractFunctionParams(pythonCode)}):\n    pass`,
    python_code: pythonCode,
    leetcode_url: `https://leetcode.com/problems/${problem.titleSlug}/`,
    neetcode_url: `https://neetcode.io/problems/${problem.titleSlug}`,
    hints: enriched?.hints || problem.hints || [],
    metadata: problem.metaData,
    examples,
    test_cases: testCases,
    sample_test_cases: [sampleTestCase],
    solutions: enriched?.solution_approaches || []
  };

  return questionData;
}

function extractFunctionParams(code) {
  // Simple extraction of function parameters from Python code
  const match = code.match(/def\s+\w+\((.*?)\)/);
  return match ? match[1] : '';
}

async function saveToDatabase(questionData) {
  try {
    // Check if question already exists
    const existing = await Question.findOne({ where: { title: questionData.title } });

    if (existing) {
      console.log(`⏭️  Skipping ${questionData.title} (already exists)`);
      return;
    }

    await Question.create(questionData);
    console.log(`✅ Saved: ${questionData.title}`);
  } catch (error) {
    console.error(`❌ Database error for ${questionData.title}:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let slugs = [];

  // 🧪 SQLITE BYPASS LOGIC
  if (args.includes('--sqlite')) {
    console.log(`\n📂 SQLite Bypass Active! Redirecting storage to local file...`);
    const { Sequelize } = require('sequelize');
    const localSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../scraped_problems.sqlite'),
      logging: false
    });
    
    // Override the model instance
    const { Question: LocalQuestion } = require('../src/models/Question');
    Question.sequelize = localSequelize;
    Question.init(Question.rawAttributes, { 
      sequelize: localSequelize, 
      tableName: 'problems_new',
      modelName: 'Question' 
    });
    
    await localSequelize.sync();
    console.log(`✅ Local SQLite ready at server/scraped_problems.sqlite [Table: problems_new]`);
  }

  if (args.includes('--all')) {
    slugs = await fetchAllProblemSlugs();
  } else {
    slugs = args.filter(a => !a.startsWith('--'));
  }

  if (slugs.length === 0) {
    console.log('Usage: node scrape-leetcode.js <slug> [slug2] [slug3]...');
    console.log('       node scrape-leetcode.js --all');
    process.exit(1);
  }

  const CONCURRENCY = 4;
  console.log(`\n🚀 Starting LeetCode Scraper (Parallelism: ${CONCURRENCY})`);
  console.log(`⏱️  Will scrape ${slugs.length} problem(s)\n`);

  const results = [];
  const queue = [...slugs];
  let processedCount = 0;

  async function worker() {
    while (queue.length > 0) {
      const slug = queue.shift();
      const currentIndex = ++processedCount;

      // Check if already in DB
      try {
        const existing = await Question.findOne({
          where: { leetcode_url: { [require('sequelize').Op.like]: `%${slug}/` } }
        });
        if (existing) {
          console.log(`⏭️  [${currentIndex}/${slugs.length}] Skipping ${slug} (already in DB)`);
          continue;
        }
      } catch (err) {}

      console.log(`\n[${currentIndex}/${slugs.length}] Processing: ${slug}`);

      try {
        const questionData = await processProblem(slug);
        if (questionData) {
          await saveToDatabase(questionData);
        }
      } catch (err) {
        console.error(`❌ Error processing ${slug}:`, err.message);
      }

      // Small delay between chunks to avoid overwhelming LeetCode
      await sleep(1000);
    }
  }

  // Start workers
  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);

  console.log(`\n✨ Scraping complete!`);
}

main().catch(console.error);
