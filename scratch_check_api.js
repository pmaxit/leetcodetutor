const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:3005/api/practice/session/1'); // Assuming session 1 exists
    if (res.ok) {
      const data = await res.json();
      const firstQuestion = Object.values(data.schedule)[0][0];
      console.log('First question in schedule:', {
        title: firstQuestion.title,
        neetcode_url: firstQuestion.neetcode_url,
        leetcode_url: firstQuestion.leetcode_url,
        youtube_url: firstQuestion.youtube_url
      });
    } else {
      console.log('Session not found');
    }
  } catch (err) {
    console.error(err);
  }
}

check();
