#!/usr/bin/env node

/**
 * Fixed LeetCode Enrichment Script
 * Uses raw SQL to properly save HTML content
 */

require('dotenv').config();
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const IMAGES_DIR = path.join(__dirname, '../../public/leetcode-images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
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
        timeout: 15000
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

async function updateViaSQL(problemId, title, htmlContent, leetcodeUrl) {
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
    console.log(`   ❌ Update failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Cloud SQL\n');

    const allProblems = await Question.findAll({
      where: { statement: { [require('sequelize').Op.ne]: null } },
      order: [['id', 'ASC']]
    });

    // Filter: only DSA problems, skip System Design
    const problems = allProblems.filter(p => !p.title.includes('System Design'));

    console.log(`🚀 LeetCode Enrichment (Fixed)\n`);
    console.log(`📊 Total problems to check: ${problems.length}`);
    console.log(`📈 Limit: 50 problems\n`);

    let enriched = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < Math.min(50, problems.length); i++) {
      const problem = problems[i];

      console.log(`[${i + 1}/50] ${problem.title}`);

      // Skip if already has substantial HTML description
      if (problem.statement && problem.statement.includes('<p>') && problem.statement.length > 500) {
        console.log(`   ⏭️  Already enriched with HTML`);
        skipped++;
        continue;
      }

      const slug = titleToSlug(problem.title);
      const leetcodeProblem = await fetchFromLeetCode(slug);

      if (!leetcodeProblem) {
        console.log(`   ⚠️  Not found on LeetCode`);
        failed++;
        if (i < Math.min(50, problems.length) - 1) {
          await sleep(2000 + Math.random() * 3000);
        }
        continue;
      }

      console.log(`   ✅ Found on LeetCode`);

      const updated = await updateViaSQL(
        problem.id,
        problem.title,
        leetcodeProblem.content,
        `https://leetcode.com/problems/${slug}/`
      );

      if (updated) {
        console.log(`   ✅ Updated database`);
        enriched++;
      } else {
        failed++;
      }

      if (i < Math.min(50, problems.length) - 1) {
        const delay = 2000 + Math.random() * 3000;
        process.stdout.write(`   ⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
        await sleep(delay);
        console.log(' ✓');
      }
    }

    console.log(`\n✨ Complete!`);
    console.log(`  ✅ Enriched: ${enriched}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

main();
