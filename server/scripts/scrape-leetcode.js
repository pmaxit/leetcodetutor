const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Question } = require('../src/models/Question');

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

// LeetCode GraphQL query for problem details
const PROBLEM_QUERY = `
  query getProblem($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      sampleTestCase
      exampleTestcases
      jsonExampleTestcases
      hints
      metaData
      stats
      codeSnippets {
        lang
        langSlug
        code
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
        operationName: 'getProblem',
        query: PROBLEM_QUERY,
        variables: { titleSlug }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `https://leetcode.com/problems/${titleSlug}/`,
        },
        timeout: 10000
      }
    );

    if (response.data.errors) {
      console.error(`❌ GraphQL Error:`, response.data.errors);
      return null;
    }

    const problem = response.data.data.question;
    console.log(`✅ Successfully fetched: ${problem.title}`);
    return problem;
  } catch (error) {
    console.error(`❌ Error fetching ${titleSlug}:`, error.message);
    return null;
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

async function processProblem(titleSlug) {
  const problem = await fetchProblemViaGraphQL(titleSlug);

  if (!problem) {
    return null;
  }

  // Find Python code snippet
  const pythonSnippet = problem.codeSnippets?.find(s => s.langSlug === 'python3');
  const pythonCode = pythonSnippet?.code || '# Solution code';

  // Process images and HTML content
  let processedContent = problem.content;
  if (problem.content && problem.content.includes('img')) {
    processedContent = await saveImagesToLocal(problem.content, problem.title);
  }

  const examples = parseExamples(processedContent);

  // Parse metadata if available
  let constraints = [];
  const constraintsMatch = processedContent.match(/<strong[^>]*>Constraints?:<\/strong>([\s\S]*?)(?=<strong|<p|$)/i);
  if (constraintsMatch) {
    // Extract constraint text and split by common delimiters
    constraints = constraintsMatch[1]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .split('\n')
      .filter(c => c.trim().length > 0)
      .map(c => c.trim());
  }

  const questionData = {
    title: problem.title,
    description: processedContent, // Full HTML
    pattern: 'Dynamic Programming', // You may want to categorize these
    category: 'Dynamic Programming',
    difficulty: problem.difficulty,
    boilerplate: `def ${problem.titleSlug.replace(/-/g, '_')}(${extractFunctionParams(pythonCode)}):\n    pass`,
    python_code: pythonCode,
    leetcode_url: `https://leetcode.com/problems/${problem.titleSlug}/`,
    hints: problem.hints || [],
    metadata: problem.metaData,
    examples,
    constraints,
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

  if (args.length === 0) {
    console.log('Usage: node scrape-leetcode.js <slug> [slug2] [slug3]...');
    console.log('Example: node scrape-leetcode.js two-sum add-two-numbers');
    process.exit(1);
  }

  console.log(`\n🚀 Starting LeetCode Scraper`);
  console.log(`⏱️  Will scrape ${args.length} problem(s)\n`);

  for (let i = 0; i < args.length; i++) {
    const slug = args[i];
    console.log(`\n[${i + 1}/${args.length}] Processing: ${slug}`);

    const questionData = await processProblem(slug);

    if (questionData) {
      await saveToDatabase(questionData);
    }

    // Rate limiting - be respectful to LeetCode servers
    if (i < args.length - 1) {
      const delaySeconds = 2 + Math.random() * 2; // 2-4 second random delay
      console.log(`⏳ Waiting ${delaySeconds.toFixed(1)}s before next request...`);
      await sleep(delaySeconds * 1000);
    }
  }

  console.log(`\n✨ Scraping complete!`);
}

main().catch(console.error);
