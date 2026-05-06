const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const q = await Question.findByPk(114);
    if (q) {
      console.log('ID 114 found:', q.title);
      console.log('URLs:', { neetcode: q.neetcode_url, youtube: q.youtube_url });
    } else {
      console.log('ID 114 NOT found');
    }
    
    const q387 = await Question.findByPk(387);
    if (q387) {
      console.log('ID 387 found:', q387.title);
      console.log('URLs:', { neetcode: q387.neetcode_url, youtube: q387.youtube_url });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
