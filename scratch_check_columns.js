const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const tableInfo = await sequelize.queryInterface.describeTable('problems');
    console.log('Table columns:', Object.keys(tableInfo));
    
    const q = await Question.findOne({ where: { title: 'Number of Distinct Islands' } });
    if (q) {
      console.log('Question found:', q.title);
      console.log('Full record:', q.get({ plain: true }));
    } else {
      console.log('Question not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
