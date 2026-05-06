const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const qs = await Question.findAll({ 
      where: { 
        [require('sequelize').Op.or]: [
          { neetcode_url: { [require('sequelize').Op.like]: '%distinct-islands%' } },
          { youtube_url: { [require('sequelize').Op.like]: '%distinct-islands%' } }
        ]
      }
    });
    console.log('Found', qs.length, 'records with matching URL strings:');
    qs.forEach(q => {
      console.log(`- ID: ${q.id}, Title: ${q.title}, Neetcode: ${q.neetcode_url}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
