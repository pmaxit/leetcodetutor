const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

async function migrate() {
  const sqlitePath = path.resolve(__dirname, '../server/database.sqlite');
  const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false
  });

  const mysql = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    }
  });

  try {
    await sqlite.authenticate();
    await mysql.authenticate();
    console.log('✅ Connected to both databases.');

    const [questions] = await sqlite.query('SELECT * FROM Questions');
    console.log(`📊 Found ${questions.length} questions in SQLite.`);

    for (const q of questions) {
      console.log(`📝 Migrating: ${q.title}`);
      
      // Map SQLite columns to MySQL columns
      const mysqlData = {
        title: q.title,
        category: q.pattern,
        statement: q.description,
        difficulty: q.difficulty,
        practice_scaffold: q.boilerplate,
        python_code: q.python_code,
        solution_format: q.solution_format,
        hints: q.hints,
        initial_probe: q.initial_probe
      };

      // Check if already exists in MySQL
      const [existing] = await mysql.query('SELECT id FROM problems WHERE title = ?', {
        replacements: [q.title]
      });

      if (existing.length > 0) {
        console.log(`⚠️  Already exists, skipping: ${q.title}`);
        continue;
      }

      await mysql.query(`
        INSERT INTO problems (title, category, statement, difficulty, practice_scaffold, python_code, solution_format, hints, initial_probe)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          mysqlData.title,
          mysqlData.category,
          mysqlData.statement,
          mysqlData.difficulty,
          mysqlData.practice_scaffold,
          mysqlData.python_code,
          mysqlData.solution_format,
          mysqlData.hints,
          mysqlData.initial_probe
        ]
      });
    }

    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sqlite.close();
    await mysql.close();
  }
}

migrate();
