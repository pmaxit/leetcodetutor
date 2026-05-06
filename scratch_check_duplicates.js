const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const qs = await Question.findAll({ 
      where: { title: 'Number of Distinct Islands' }
    });
    console.log('Found', qs.length, 'records for Number of Distinct Islands');
    qs.forEach((q, i) => {
      console.log(`Record ${i}:`, {
        id: q.id,
        neetcode_url: q.neetcode_url,
        leetcode_url: q.leetcode_url,
        youtube_url: q.youtube_url
      });
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
