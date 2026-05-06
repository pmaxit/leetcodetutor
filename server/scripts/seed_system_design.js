const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { Question, sequelize } = require('../src/models/Question');

const INPUT_DIR = path.join(__dirname, '../../hellointerview-system-design');

function parseMarkdownToStages(markdown) {
  const titleMatch = markdown.match(/^#\s+(.+)/m);
  let title = titleMatch ? titleMatch[1].replace(/\|.*$/, '').trim() : 'System Design Problem';

  // Helper to extract text between two regex patterns
  function extractSection(text, startRegex, endRegex) {
    const startMatch = text.match(startRegex);
    if (!startMatch) return '';
    const startIndex = startMatch.index + startMatch[0].length;
    const remainingText = text.substring(startIndex);
    
    let endIndex = remainingText.length;
    if (endRegex) {
      const endMatch = remainingText.match(endRegex);
      if (endMatch) {
        endIndex = endMatch.index;
      }
    }
    return remainingText.substring(0, endIndex).trim();
  }

  // Regular expressions for sections
  const reqStart = /###\s*(?:\[)?Functional Requirements(?:\])?.*?\n/i;
  const nonReqStart = /###\s*(?:\[)?Non-Functional Requirements(?:\])?.*?\n/i;
  const entitiesStart = /###\s*(?:\[)?Defining the Core Entities(?:\])?.*?\n/i;
  const apiStart = /###\s*(?:\[)?API (?:or|and) System Interface(?:\])?.*?\n/i;
  const hldStart = /##\s*(?:\[)?High-Level Design(?:\])?.*?\n/i;
  const deepDivesStart = /##\s*(?:\[)?Potential Deep Dives(?:\])?.*?\n/i;
  const whatExpectedStart = /##\s*(?:\[)?What is Expected at Each Level\??(?:\])?.*?\n/i;

  const functionalText = extractSection(markdown, reqStart, nonReqStart);
  const nonFunctionalText = extractSection(markdown, nonReqStart, /(?:##\s+The Set Up)|(?:###\s*(?:\[)?Defining the Core Entities(?:\])?)/i);
  const entitiesText = extractSection(markdown, entitiesStart, apiStart);
  const apiText = extractSection(markdown, apiStart, hldStart);
  const hldText = extractSection(markdown, hldStart, deepDivesStart);
  const deepDivesText = extractSection(markdown, deepDivesStart, whatExpectedStart);

  const stages = [
    {
      id: 1,
      name: 'Functional Requirements',
      icon: '📋',
      prompt: 'What are the **core functional requirements**? Define what the system must do from a user-facing perspective.',
      hint: 'Think: What does a user actually DO with this system? What are the must-haves vs nice-to-haves?',
      referenceAnswer: { core: [functionalText.substring(0, 500) + '... (parsed)'] }
    },
    {
      id: 2,
      name: 'Non-Functional Requirements',
      icon: '⚡',
      prompt: 'Define the **non-functional requirements**: performance targets, reliability, scale, and key trade-offs.',
      hint: 'Think about: latency SLAs, availability target, scale, and the CAP trade-off.',
      referenceAnswer: { core: [nonFunctionalText.substring(0, 500) + '... (parsed)'] }
    },
    {
      id: 3,
      name: 'Core Entities',
      icon: '🗄️',
      prompt: 'Define the **core data entities** your system needs. What does the database schema look like at a high level?',
      hint: 'What data do you need to store? What are the key fields?',
      referenceAnswer: { entities: [entitiesText.substring(0, 500) + '... (parsed)'] }
    },
    {
      id: 4,
      name: 'API Design',
      icon: '🔌',
      prompt: 'Design the **REST API** for your system. List the endpoints, HTTP methods, request/response formats.',
      hint: 'What are the core operations?',
      referenceAnswer: { endpoints: [apiText.substring(0, 500) + '... (parsed)'] }
    },
    {
      id: 5,
      name: 'High-Level Design',
      icon: '🏗️',
      prompt: 'Sketch the **high-level architecture**. Draw the major components and how they interact. Use the whiteboard!',
      hint: 'Walk through the main flows. What components touch each request?',
      referenceAnswer: { components: [hldText.substring(0, 500) + '... (parsed)'] }
    },
    {
      id: 6,
      name: 'Deep Dives',
      icon: '🔬',
      prompt: '**Deep Dive:** Let us dive deep into some potential issues. How would you scale this system?',
      hint: 'Consider single points of failure, scaling reads vs writes, and bottlenecks.',
      referenceAnswer: { approaches: [deepDivesText.substring(0, 500) + '... (parsed)'] }
    }
  ];

  return { title, stages };
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const files = fs.readdirSync(INPUT_DIR);
    const questions = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(INPUT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const { title, stages } = parseMarkdownToStages(content);
      
      questions.push({
        title,
        category: 'System Design',
        difficulty: 'Medium', // Or parsed if possible
        statement: `System Design Problem: ${title}`,
        solution_format: JSON.stringify(stages)
      });
    }

    console.log(`Parsed ${questions.length} questions. Saving to DB...`);
    
    const maxIdResult = await sequelize.query('SELECT MAX(id) as maxId FROM problems');
    let nextId = (maxIdResult[0][0].maxId || 0) + 1;

    for(const q of questions) {
       // Only insert if it doesn't already exist to prevent duplicates
       const existing = await Question.findOne({ where: { title: q.title } });
       if(!existing) {
         q.id = nextId++;
         await Question.create(q);
       } else {
         await existing.update(q);
       }
    }

    console.log("System Design Questions seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
