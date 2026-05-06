const { Question } = require('./server/src/models/Question');
require('dotenv').config();

async function check() {
  const q = await Question.findOne({ where: { title: 'Two Sum' } });
  if (q) {
    console.log('Title:', q.title);
    console.log('Scaffold:');
    console.log('-------------------');
    console.log(q.practice_scaffold);
    console.log('-------------------');
  } else {
    console.log('Question not found');
  }
  process.exit(0);
}

check();
