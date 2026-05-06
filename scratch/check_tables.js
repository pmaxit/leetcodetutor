const sequelize = require('../server/src/models/db');

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tables in DB:', results);
    
    for (const row of results) {
        const tableName = Object.values(row)[0];
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`📊 Table \`${tableName}\` has ${count[0].count} rows.`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
