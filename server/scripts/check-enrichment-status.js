#!/usr/bin/env node

/**
 * Check LeetCode Enrichment Status
 * Shows which problems have been enriched and which need it
 *
 * Usage: node server/scripts/check-enrichment-status.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

async function checkStatus() {
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
    id: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING },
    statement: { type: DataTypes.TEXT },
    leetcode_url: { type: DataTypes.STRING },
  }, {
    tableName: 'problems',
    timestamps: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Cloud SQL\n');

    const problems = await Question.findAll({
      order: [['id', 'ASC']]
    });

    let enriched = 0;
    let needsEnrichment = 0;
    const enrichedList = [];
    const needsList = [];

    problems.forEach(p => {
      const hasDescription = p.statement && p.statement.length > 200;
      if (hasDescription) {
        enriched++;
        enrichedList.push({
          title: p.title,
          size: p.statement.length
        });
      } else {
        needsEnrichment++;
        needsList.push(p.title);
      }
    });

    // Display summary
    console.log('📊 Enrichment Status');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total problems:    ${problems.length}`);
    console.log(`✅ Enriched:       ${enriched} (${Math.round(enriched/problems.length*100)}%)`);
    console.log(`⏳ Needs enrichment: ${needsEnrichment}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    if (enrichedList.length > 0) {
      console.log('✅ ENRICHED PROBLEMS:');
      enrichedList.slice(0, 10).forEach(p => {
        console.log(`   • ${p.title} (${p.size} bytes)`);
      });
      if (enrichedList.length > 10) {
        console.log(`   ... and ${enrichedList.length - 10} more`);
      }
      console.log('');
    }

    if (needsList.length > 0) {
      console.log('⏳ NEEDS ENRICHMENT:');
      needsList.slice(0, 10).forEach(title => {
        console.log(`   • ${title}`);
      });
      if (needsList.length > 10) {
        console.log(`   ... and ${needsList.length - 10} more`);
      }
      console.log('');

      // Suggest command
      if (needsList.length > 0) {
        console.log('💡 To enrich, run:');
        console.log(`   node server/scripts/enrich-from-leetcode.js --limit ${Math.min(needsList.length, 10)}`);
        console.log(`\n   Or start from a specific problem:`);
        console.log(`   node server/scripts/enrich-from-leetcode.js --start-from "${needsList[0]}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkStatus().catch(console.error);
