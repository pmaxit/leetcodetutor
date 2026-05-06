const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const q = await Question.findOne({ where: { title: 'Best Meeting Point' } });
    if (q) {
      console.log('Record found:', {
        id: q.id,
        title: q.title,
        neetcode_url: q.neetcode_url,
        youtube_url: q.youtube_url,
        leetcode_url: q.leetcode_url
      });
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
