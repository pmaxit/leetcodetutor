const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log(`\n🔍 Checking Hints Data in neetcode_db.problems\n`);
    console.log('='.repeat(80) + '\n');

    // Get sample problems with hints
    const [results] = await sequelize.query(
      'SELECT id, title, category, hints FROM problems WHERE hints IS NOT NULL LIMIT 10'
    );

    console.log(`Found ${results.length} problems with hints:\n`);

    results.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.title} (ID: ${row.id})`);
      console.log(`   Category: ${row.category}`);

      try {
        const hints = typeof row.hints === 'string' ? JSON.parse(row.hints) : row.hints;
        if (Array.isArray(hints)) {
          console.log(`   Hints: ${hints.length} found`);
          hints.forEach((hint, i) => {
            const preview = hint.substring(0, 65) + (hint.length > 65 ? '...' : '');
            console.log(`     ${i + 1}. ${preview}`);
          });
        } else {
          console.log(`   Hints: Invalid format (type: ${typeof hints})`);
        }
      } catch (e) {
        console.log(`   Hints: Could not parse - ${e.message}`);
      }
      console.log();
    });

    // Count coverage
    const [counts] = await sequelize.query(
      'SELECT COUNT(*) as total, SUM(IF(hints IS NOT NULL AND hints != "", 1, 0)) as with_hints FROM problems'
    );

    const total = counts[0].total;
    const withHints = counts[0].with_hints;
    const coverage = ((withHints / total) * 100).toFixed(1);

    console.log('='.repeat(80));
    console.log(`\n📊 Coverage Statistics:`);
    console.log(`   Total problems: ${total}`);
    console.log(`   With hints: ${withHints}`);
    console.log(`   Coverage: ${coverage}%`);
    console.log(`   Missing: ${total - withHints}\n`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
