const { sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const [results, metadata] = await sequelize.query("SELECT * FROM problems WHERE title = 'Number of Distinct Islands'");
    console.log('Raw row:', results[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
