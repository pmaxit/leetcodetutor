const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const q = await Question.findOne({ where: { title: { [require('sequelize').Op.like]: '%Consistent Hashing%' } } });
    if (q) {
      console.log('Question found:', q.title);
      console.log('URLs:', { neetcode: q.neetcode_url, youtube: q.youtube_url, leetcode: q.leetcode_url });
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
