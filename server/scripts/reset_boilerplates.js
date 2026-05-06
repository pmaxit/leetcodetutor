const { Question } = require('../src/models/Question');
const db = require('../src/models/db');
function extractBoilerplate(code) {
  if (!code) return code;
  
  const lines = code.split('\n');
  const boilerplateLines = [];
  let inClass = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('import ') || line.startsWith('from ')) {
      boilerplateLines.push(line);
    } else if (line.startsWith('class Solution:')) {
      inClass = true;
      boilerplateLines.push(line);
    } else if (inClass && line.match(/^    def [a-zA-Z0-9_]+\(.*\)(?: -> .*)?:/)) {
      boilerplateLines.push(line);
      boilerplateLines.push('        pass');
      boilerplateLines.push('');
    }
  }
  
  if (boilerplateLines.length > 0) {
    return boilerplateLines.join('\n').trim() + '\n';
  }
  return code;
}

async function run() {
  try {
    const questions = await Question.findAll();
    let updated = 0;
    
    for (const q of questions) {
      if (q.python_code) {
        const boiler = extractBoilerplate(q.python_code);
        if (boiler && boiler !== q.python_code) {
          q.practice_scaffold = boiler;
          await q.save();
          updated++;
        }
      }
    }
    console.log(`Updated ${updated} boilerplates.`);
  } catch (err) {
    console.error(err);
  } finally {
    await db.close();
  }
}

run();
