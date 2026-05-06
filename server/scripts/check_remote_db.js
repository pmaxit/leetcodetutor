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

const Question = sequelize.define('Question', {}, {
  tableName: 'problems',
  timestamps: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log(`✓ Connected to ${process.env.DB_DIALECT} database: ${process.env.DB_NAME}`);
    console.log(`  Host: ${process.env.DB_HOST}\n`);

    // Check table structure
    let result;
    if (process.env.DB_DIALECT === 'mysql') {
      result = await sequelize.query(
        `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'problems'
         ORDER BY ORDINAL_POSITION`,
        { replacements: [process.env.DB_NAME] }
      );
    } else {
      // SQLite - use pragma
      result = await sequelize.query(`PRAGMA table_info(problems)`);
    }

    console.log('Columns in problems table:');
    if (process.env.DB_DIALECT === 'mysql') {
      result[0].forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      result[0].forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }

    // Check if hints column exists
    const hasHints = process.env.DB_DIALECT === 'mysql'
      ? result[0].some(col => col.COLUMN_NAME === 'hints')
      : result[0].some(col => col.name === 'hints');

    console.log(`\n${hasHints ? '✓' : '✗'} hints column: ${hasHints ? 'EXISTS' : 'MISSING'}`);

    // Count rows
    const count = await Question.count();
    console.log(`✓ Total problems in table: ${count}`);

    // Check sample
    if (hasHints) {
      const sample = await sequelize.query(
        'SELECT id, title, hints FROM problems LIMIT 1'
      );
      if (sample[0].length > 0) {
        const row = sample[0][0];
        console.log(`\nSample problem (ID: ${row.id}):`);
        console.log(`  Title: ${row.title}`);
        console.log(`  Hints present: ${row.hints ? 'YES' : 'NO'}`);
      }
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();
