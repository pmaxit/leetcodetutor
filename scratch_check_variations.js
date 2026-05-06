const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const qs = await Question.findAll({ 
      where: { 
        title: { [require('sequelize').Op.like]: '%Distinct Islands%' } 
      }
    });
    console.log('Found', qs.length, 'records:');
    qs.forEach(q => {
      console.log(`- ID: ${q.id}, Title: ${q.title}, Neetcode: ${q.neetcode_url}, Leetcode: ${q.leetcode_url}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
