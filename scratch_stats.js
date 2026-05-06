const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const total = await Question.count();
    const withNeetcode = await Question.count({ where: { neetcode_url: { [require('sequelize').Op.ne]: null } } });
    const withYoutube = await Question.count({ where: { youtube_url: { [require('sequelize').Op.ne]: null } } });
    const withLeetcode = await Question.count({ where: { leetcode_url: { [require('sequelize').Op.ne]: null } } });

    console.log('Total questions:', total);
    console.log('With Neetcode URL:', withNeetcode);
    console.log('With Youtube URL:', withYoutube);
    console.log('With Leetcode URL:', withLeetcode);
    
    // Check "Number of Distinct Islands" again
    const q = await Question.findOne({ where: { title: 'Number of Distinct Islands' } });
    if (q) {
      console.log('Number of Distinct Islands:', {
        neetcode: q.neetcode_url,
        youtube: q.youtube_url,
        leetcode: q.leetcode_url
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
