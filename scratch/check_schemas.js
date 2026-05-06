const sequelize = require('../server/src/models/db');

async function checkSchema() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE system_design_problems");
    console.log('📋 Schema of `system_design_problems`:', results);
    
    const [results2] = await sequelize.query("DESCRIBE problems");
    console.log('📋 Schema of `problems`:', results2);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
