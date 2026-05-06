const { Question, sequelize } = require('../server/src/models/Question');

async function checkDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    const count = await Question.count();
    console.log(`📊 Total questions in DB: ${count}`);
    if (count > 0) {
      const first = await Question.findOne();
      console.log(`📝 Example question: ${first.title}`);
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDB();
