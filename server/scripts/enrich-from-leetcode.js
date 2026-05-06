#!/usr/bin/env node

/**
 * Enrich NeetCode DB Problems with LeetCode Descriptions
 *
 * Fetches full problem descriptions from LeetCode for each problem in your
 * Cloud SQL database, preserving HTML formatting and downloading images.
 *
 * Usage:
 *   node server/scripts/enrich-from-leetcode.js [--limit 10] [--start-from "Two Sum"]
 *
 * Environment variables (from .env):
 *   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (Cloud SQL config)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const IMAGES_DIR = path.join(__dirname, '../../public/leetcode-images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`✅ Created images directory: ${IMAGES_DIR}`);
}

// GraphQL query for full problem details
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
    }
  }
`;

// ─── Database Connection ───────────────────────────────────────────────────

async function connectToCloudSQL() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
      dialectOptions: {
        ssl: { rejectUnauthorized: false }
      }
    }
  );

  const Question = sequelize.define('questions', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    statement: { type: DataTypes.TEXT },
    difficulty: { type: DataTypes.STRING },
    practice_scaffold: { type: DataTypes.TEXT },
    python_code: { type: DataTypes.TEXT },
    neetcode_url: { type: DataTypes.STRING },
    leetcode_url: { type: DataTypes.STRING },
  }, {
    tableName: 'problems',
    timestamps: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Cloud SQL');
  } catch (error) {
    console.error('❌ Cloud SQL connection failed:', error.message);
    console.log('⚠️  Make sure your .env has DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  }

  return { sequelize, Question };
}

// ─── Title to Slug Conversion ──────────────────────────────────────────────

function titleToSlug(title) {
  // Convert "Two Sum" -> "two-sum"
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── LeetCode Fetching ────────────────────────────────────────────────────

async function fetchFromLeetCode(titleSlug) {
  try {
    console.log(`   📡 Fetching from LeetCode...`);

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
        timeout: 15000
      }
    );

    if (response.data.errors) {
      console.log(`   ⚠️  GraphQL Error: ${response.data.errors[0]?.message}`);
      return null;
    }

    const problem = response.data.data?.question;
    if (!problem) {
      console.log(`   ⚠️  Problem not found on LeetCode`);
      return null;
    }

    console.log(`   ✅ Found: ${problem.title}`);
    return problem;
  } catch (error) {
    console.log(`   ⚠️  Fetch failed: ${error.message}`);
    return null;
  }
}

// ─── Image Handling ───────────────────────────────────────────────────────

async function downloadAndReplaceImages(htmlContent) {
  // Find all image URLs
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match;
  const images = [];

  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Only process LeetCode and CDN images
    if (url.includes('leetcode') || url.includes('assets') || url.includes('cdn')) {
      images.push(url);
    }
  }

  console.log(`   📸 Found ${images.length} image(s)`);

  let modifiedHtml = htmlContent;

  for (const imageUrl of images) {
    try {
      // Generate local filename from URL
      const urlObj = new URL(imageUrl);
      let filename = path.basename(urlObj.pathname);

      // If no extension, add .png
      if (!filename.includes('.')) {
        filename += '.png';
      }

      const filepath = path.join(IMAGES_DIR, filename);

      // Download if not already cached
      if (!fs.existsSync(filepath)) {
        console.log(`      📥 Downloading: ${filename}`);
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'Referer': 'https://leetcode.com/'
          }
        });

        fs.writeFileSync(filepath, response.data);
      } else {
        console.log(`      ✓ Already cached: ${filename}`);
      }

      // Replace URL in HTML
      modifiedHtml = modifiedHtml.replace(
        imageUrl,
        `/leetcode-images/${filename}`
      );
    } catch (err) {
      console.log(`      ⚠️  Image download failed: ${err.message}`);
    }
  }

  return modifiedHtml;
}

// ─── Database Update ──────────────────────────────────────────────────────

async function updateProblemInDB(Question, problemId, title, htmlDescription, leetcodeUrl) {
  try {
    const problem = await Question.findByPk(problemId);

    if (!problem) {
      console.log(`   ❌ Problem not found in DB`);
      return false;
    }

    await problem.update({
      statement: htmlDescription,
      leetcode_url: leetcodeUrl
    });

    console.log(`   ✅ Updated database`);
    return true;
  } catch (error) {
    console.log(`   ❌ Update failed: ${error.message}`);
    return false;
  }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function respectfulDelay() {
  // Random 2-5 second delay
  const delay = 2000 + Math.random() * 3000;
  process.stdout.write(`   ⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
  await sleep(delay);
  console.log(' ✓');
}

// ─── Main Process ────────────────────────────────────────────────────────

async function main() {
  const { sequelize, Question } = await connectToCloudSQL();

  // Parse arguments (support both --limit=20 and --limit 20 formats)
  const limitIndex = process.argv.indexOf('--limit');
  const startIndex = process.argv.indexOf('--start-from');

  let limit = Infinity;
  if (limitIndex !== -1) {
    // Try format --limit=20
    if (process.argv[limitIndex].includes('=')) {
      limit = parseInt(process.argv[limitIndex].split('=')[1]);
    } else if (process.argv[limitIndex + 1]) {
      // Try format --limit 20
      limit = parseInt(process.argv[limitIndex + 1]);
    }
  }

  let startFrom = null;
  if (startIndex !== -1) {
    // Try format --start-from=value
    if (process.argv[startIndex].includes('=')) {
      startFrom = process.argv[startIndex].split('=')[1].replace(/"/g, '');
    } else if (process.argv[startIndex + 1]) {
      // Try format --start-from value
      startFrom = process.argv[startIndex + 1].replace(/"/g, '');
    }
  }

  console.log('\n🚀 LeetCode Enrichment Script');
  console.log(`📊 Fetching problems from Cloud SQL: ${process.env.DB_NAME}`);
  if (startFrom) console.log(`📍 Starting from: ${startFrom}`);
  console.log(`📈 Limit: ${limit === Infinity ? 'All' : limit}\n`);

  try {
    // Get all problems
    const allProblems = await Question.findAll({
      order: [['id', 'ASC']]
    });

    console.log(`📋 Found ${allProblems.length} problems in database\n`);

    // Filter based on start position
    let problems = allProblems;
    if (startFrom) {
      const startIndex = problems.findIndex(p => p.title.includes(startFrom));
      if (startIndex === -1) {
        console.error(`❌ Problem "${startFrom}" not found`);
        process.exit(1);
      }
      problems = problems.slice(startIndex);
    }

    // Apply limit
    problems = problems.slice(0, limit);

    let enriched = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];

      console.log(`\n[${i + 1}/${problems.length}] ${problem.title}`);

      // Skip System Design topics (not on LeetCode)
      if (problem.title.includes('System Design')) {
        console.log(`   ⏭️  Skipping System Design topic`);
        skipped++;
        continue;
      }

      // Skip if already has statement
      if (problem.statement && problem.statement.length > 200) {
        console.log(`   ⏭️  Already enriched (${problem.statement.length} chars)`);
        skipped++;
        continue;
      }

      // Convert title to LeetCode slug
      const slug = titleToSlug(problem.title);
      const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;

      // Fetch from LeetCode
      const leetcodeProblem = await fetchFromLeetCode(slug);

      if (!leetcodeProblem) {
        console.log(`   ⚠️  Could not fetch from LeetCode`);
        failed++;
        if (i < problems.length - 1) await respectfulDelay();
        continue;
      }

      // Download images and replace URLs
      let htmlContent = leetcodeProblem.content;
      if (htmlContent && htmlContent.includes('<img')) {
        htmlContent = await downloadAndReplaceImages(htmlContent);
      }

      // Update database
      const updated = await updateProblemInDB(
        Question,
        problem.id,
        problem.title,
        htmlContent,
        leetcodeUrl
      );

      if (updated) {
        enriched++;
      } else {
        failed++;
      }

      // Be respectful with rate limiting
      if (i < problems.length - 1) {
        await respectfulDelay();
      }
    }

    console.log(`\n\n✨ Enrichment Complete!`);
    console.log(`  ✅ Enriched: ${enriched}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📸 Images saved to: ${IMAGES_DIR}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

main().catch(console.error);
