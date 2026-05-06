const { Sequelize } = require('sequelize');
const path = require('path');

async function checkSQLite() {
  const dbPath = path.resolve(__dirname, '../server/database.sqlite');
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQLite.');
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tables in SQLite:', results);
    
    for (const row of results) {
        const tableName = row.name;
        if (tableName === 'sqlite_sequence') continue;
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`📊 Table \`${tableName}\` has ${count[0].count} rows.`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkSQLite();
