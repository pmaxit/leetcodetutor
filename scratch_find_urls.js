const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const qs = await Question.findAll({ 
      where: { 
        neetcode_url: { [require('sequelize').Op.ne]: null } 
      },
      limit: 5
    });
    console.log('Questions with Neetcode URL:', qs.map(q => ({ title: q.title, url: q.neetcode_url })));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
