const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:3005/api/questions');
    if (res.ok) {
      const data = await res.json();
      const q = data.find(x => x.title === 'Number of Distinct Islands');
      if (q) {
        console.log('API response for question:', q);
      } else {
        console.log('Question not found in API');
      }
    } else {
      console.log('API failed');
    }
  } catch (err) {
    console.error(err);
  }
}

check();
