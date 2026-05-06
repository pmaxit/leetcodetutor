const { sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const tableInfo = await sequelize.queryInterface.describeTable('system_design_problems');
    console.log('Columns in system_design_problems:', Object.keys(tableInfo));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
