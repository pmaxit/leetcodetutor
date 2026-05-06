const { Question } = require('./server/src/models/Question');
require('dotenv').config();

async function view() {
  const q = await Question.findOne({ where: { title: 'Group Anagrams' } });
  if (q) {
    console.log('Title:', q.title);
    console.log('Python Code:');
    console.log('-------------------');
    console.log(q.python_code);
    console.log('-------------------');
  }
  process.exit(0);
}

view();
