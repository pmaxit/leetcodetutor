const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const q = await Question.findOne({ where: { title: 'Number of Distinct Islands' } });
    if (q) {
      console.log('Mnemonic:', q.mnemonic);
      console.log('Guided Hints:', q.guided_hints);
      console.log('Problem Format:', q.problem_format);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
