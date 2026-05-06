const { sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('Tables:', results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
