#!/usr/bin/env node

/**
 * LeetCode Enrichment with Image Downloads
 * Fetches HTML, downloads images, and stores locally
 */

require('dotenv').config();
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const IMAGES_DIR = path.join(__dirname, '../../public/leetcode-images');

// Create images directory
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log('📁 Created images directory');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    dialectOptions: { ssl: { rejectUnauthorized: false } }
  }
);

const Question = sequelize.define('questions', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  title: { type: DataTypes.STRING },
  statement: { type: DataTypes.TEXT },
  leetcode_url: { type: DataTypes.STRING },
}, { tableName: 'problems', timestamps: false });

const PROBLEM_QUERY = `
  query getProblem($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      content
    }
  }
`;

function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFromLeetCode(slug) {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        operationName: 'getProblem',
        query: PROBLEM_QUERY,
        variables: { titleSlug: slug }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 20000
      }
    );

    if (response.data.errors) {
      return null;
    }

    return response.data.data?.question;
  } catch (error) {
    return null;
  }
}

async function downloadAndReplaceImages(htmlContent, problemTitle) {
  let modifiedHtml = htmlContent;

  // Find all image URLs
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let match;
  const images = [];

  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Only download LeetCode/CDN images
    if (url.includes('leetcode') || url.includes('assets') || url.includes('cdn')) {
      images.push(url);
    }
  }

  if (images.length === 0) {
    return htmlContent;
  }

  console.log(`      📸 Found ${images.length} image(s)`);

  for (const imageUrl of images) {
    try {
      // Generate local filename with hash to avoid conflicts
      const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const ext = path.extname(new URL(imageUrl).pathname) || '.png';
      const filename = `leetcode-${urlHash}${ext}`;
      const filepath = path.join(IMAGES_DIR, filename);

      // Download if not cached
      if (!fs.existsSync(filepath)) {
        console.log(`         📥 Downloading: ${filename}`);
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'Referer': 'https://leetcode.com/',
            'User-Agent': 'Mozilla/5.0'
          }
        });

        fs.writeFileSync(filepath, response.data);
      } else {
        console.log(`         ✓ Cached: ${filename}`);
      }

      // Replace URL in HTML
      modifiedHtml = modifiedHtml.replace(new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `/leetcode-images/${filename}`);
    } catch (err) {
      console.log(`         ⚠️  Failed to download: ${err.message}`);
    }
  }

  return modifiedHtml;
}

async function updateViaSQL(problemId, htmlContent, leetcodeUrl) {
  try {
    await sequelize.query(
      'UPDATE problems SET statement = ?, leetcode_url = ? WHERE id = ?',
      {
        replacements: [htmlContent, leetcodeUrl, problemId],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    return true;
  } catch (error) {
    console.log(`      ❌ Update failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Cloud SQL\n');

    const allProblems = await Question.findAll({
      order: [['id', 'ASC']]
    });

    // Filter: only DSA problems, skip System Design
    const problems = allProblems.filter(p => !p.title.includes('System Design'));

    console.log(`🚀 LeetCode Enrichment with Images\n`);
    console.log(`📊 Total DSA problems: ${problems.length}`);
    console.log(`📈 Processing limit: 30 problems\n`);

    let enriched = 0;
    let withImages = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < Math.min(30, problems.length); i++) {
      const problem = problems[i];

      console.log(`[${i + 1}/30] ${problem.title}`);

      // Skip if already has substantial HTML
      if (problem.statement && problem.statement.includes('<p>') && problem.statement.length > 500) {
        console.log(`      ⏭️  Already enriched`);
        skipped++;
        continue;
      }

      const slug = titleToSlug(problem.title);
      const leetcodeProblem = await fetchFromLeetCode(slug);

      if (!leetcodeProblem) {
        console.log(`      ⚠️  Not found on LeetCode`);
        failed++;
        if (i < Math.min(30, problems.length) - 1) {
          await sleep(2000 + Math.random() * 3000);
        }
        continue;
      }

      console.log(`      ✅ Found on LeetCode`);

      // Download and replace images
      let htmlContent = leetcodeProblem.content;
      if (htmlContent.includes('<img')) {
        htmlContent = await downloadAndReplaceImages(htmlContent, problem.title);
        withImages++;
      }

      const updated = await updateViaSQL(
        problem.id,
        htmlContent,
        `https://leetcode.com/problems/${slug}/`
      );

      if (updated) {
        console.log(`      ✅ Updated database`);
        enriched++;
      } else {
        failed++;
      }

      if (i < Math.min(30, problems.length) - 1) {
        const delay = 2000 + Math.random() * 3000;
        process.stdout.write(`      ⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
        await sleep(delay);
        console.log(' ✓');
      }
    }

    console.log(`\n✨ Complete!`);
    console.log(`  ✅ Enriched: ${enriched}`);
    console.log(`  🖼️  With images: ${withImages}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📁 Images saved to: ${IMAGES_DIR}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

main();
