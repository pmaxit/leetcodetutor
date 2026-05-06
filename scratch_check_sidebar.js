const { Question, sequelize } = require('./server/src/models/Question');

async function check() {
  try {
    const titles = [
      'Count of Range Sum',
      'Short Encoding of Words',
      'Flower Planting With No Adjacent',
      'Unique Binary Search Trees',
      'Inorder Successor in BST',
      'Best Meeting Point'
    ];
    const qs = await Question.findAll({ 
      where: { title: titles }
    });
    console.log('Results:');
    qs.forEach(q => {
      console.log(`- ${q.title}: Neetcode=${q.neetcode_url}, Youtube=${q.youtube_url}, Leetcode=${q.leetcode_url}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
