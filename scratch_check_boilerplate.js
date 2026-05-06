const { Question } = require('./server/src/models/Question');
const db = require('./server/src/models/db');

async function check() {
  const q = await Question.findOne({ where: { category: 'Arrays & Hashing' } });
  console.log("Title:", q.title);
  console.log("practice_scaffold length:", q.practice_scaffold?.length);
  console.log("python_code length:", q.python_code?.length);
  console.log("practice_scaffold head:", q.practice_scaffold?.substring(0, 100));
  console.log("python_code head:", q.python_code?.substring(0, 100));
}
check().catch(console.error).finally(() => db.close());
