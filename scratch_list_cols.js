const { sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const tableInfo = await sequelize.queryInterface.describeTable('problems');
    console.log('Columns:', Object.keys(tableInfo));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
