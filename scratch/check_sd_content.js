const sequelize = require('../server/src/models/db');

async function checkSD() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT * FROM system_design_problems LIMIT 1");
    console.log('📝 Example SD question from `system_design_problems`:', results[0]);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkSD();
