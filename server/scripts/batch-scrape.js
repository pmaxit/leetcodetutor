#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Question } = require('../src/models/Question');

/**
 * Batch LeetCode Scraper
 * Scrapes multiple problems from a JSON list using the GraphQL endpoint
 *
 * Usage: node server/scripts/batch-scrape.js [--limit 10] [--category Dynamic Programming]
 */

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const PROBLEM_QUERY = `
  query getProblem($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      exampleTestcases
      hints
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

async function fetchProblem(titleSlug) {
  try {
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
      console.error(`❌ Error fetching ${titleSlug}:`, response.data.errors[0]?.message);
      return null;
    }

    return response.data.data.question;
  } catch (error) {
    console.error(`❌ Fetch error ${titleSlug}:`, error.message);
    return null;
  }
}

async function saveToDatabase(problem, category = 'Dynamic Programming') {
  try {
    const existing = await Question.findOne({ where: { title: problem.title } });

    if (existing) {
      console.log(`  ⏭️  Already exists`);
      return false;
    }

    const pythonSnippet = problem.codeSnippets?.find(s => s.langSlug === 'python3');

    const questionData = {
      title: problem.title,
      description: problem.content,
      pattern: category,
      category,
      difficulty: problem.difficulty,
      boilerplate: pythonSnippet?.code || '# Solution',
      python_code: pythonSnippet?.code || '# Solution',
      leetcode_url: `https://leetcode.com/problems/${problem.titleSlug}/`,
      hints: problem.hints || [],
    };

    await Question.create(questionData);
    console.log(`  ✅ Saved to DB`);
    return true;
  } catch (error) {
    console.error(`  ❌ DB error:`, error.message);
    return false;
  }
}

async function main() {
  const problemsFile = path.join(__dirname, 'leetcode-problems.json');

  if (!fs.existsSync(problemsFile)) {
    console.error('❌ leetcode-problems.json not found');
    process.exit(1);
  }

  const problemsList = JSON.parse(fs.readFileSync(problemsFile, 'utf8'));
  const problems = problemsList.common_problems;

  // Parse arguments
  const limitArg = process.argv.find(arg => arg.startsWith('--limit'));
  const categoryArg = process.argv.find(arg => arg.startsWith('--category'));

  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : problems.length;
  const category = categoryArg ? categoryArg.split('=')[1] : 'Dynamic Programming';

  const toScrape = problems.slice(0, limit);

  console.log(`\n🚀 LeetCode Batch Scraper`);
  console.log(`📊 Found ${toScrape.length} problem(s) to scrape`);
  console.log(`📁 Category: ${category}\n`);

  let saved = 0;
  let failed = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const { slug, title, difficulty } = toScrape[i];
    console.log(`[${i + 1}/${toScrape.length}] ${title} (${difficulty})`);

    const problem = await fetchProblem(slug);

    if (problem) {
      const didSave = await saveToDatabase(problem, category);
      if (didSave) saved++;
    } else {
      failed++;
    }

    // Respectful rate limiting
    if (i < toScrape.length - 1) {
      const delay = 2 + Math.random() * 3; // 2-5 seconds
      process.stdout.write(`  ⏳ Waiting ${delay.toFixed(1)}s...`);
      await sleep(delay * 1000);
      console.log(' Done');
    }
  }

  console.log(`\n✨ Complete!`);
  console.log(`  ✅ Saved: ${saved}`);
  console.log(`  ❌ Failed: ${failed}`);
}

main().catch(console.error);
