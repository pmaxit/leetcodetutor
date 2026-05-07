const fs = require('fs');
const path = require('path');

const SD_SOLUTIONS_DIR = path.join(__dirname, '../../../hellointerview-system-design');

const extractSection = (text, startRegex, endRegex) => {
  const startMatch = text.match(startRegex);
  if (!startMatch) return '';
  const startIndex = (startMatch.index || 0) + startMatch[0].length;
  const remainingText = text.substring(startIndex);

  let endIndex = remainingText.length;
  if (endRegex) {
    const endMatch = remainingText.match(endRegex);
    if (endMatch && typeof endMatch.index === 'number') {
      endIndex = endMatch.index;
    }
  }
  return remainingText.substring(0, endIndex).trim();
};

const getOriginalSolutionSectionsForQuestion = (question) => {
  try {
    const parsed = JSON.parse(question.solution_format || '{}');
    const originalUrl = Array.isArray(parsed) ? '' : (parsed.originalUrl || '');
    if (!originalUrl) return null;

    const slugTail = originalUrl.split('/').pop();
    if (!slugTail) return null;

    const filePath = path.join(SD_SOLUTIONS_DIR, `problem-breakdowns-${slugTail}.md`);
    if (!fs.existsSync(filePath)) return null;

    const markdown = fs.readFileSync(filePath, 'utf8');

    const reqStart = /###\s*(?:\[)?Functional Requirements(?:\])?.*?\n/i;
    const nonReqStart = /###\s*(?:\[)?Non-Functional Requirements(?:\])?.*?\n/i;
    const entitiesStart = /###\s*(?:\[)?Defining the Core Entities(?:\])?.*?\n/i;
    const apiStart = /###\s*(?:\[)?(?:The )?API(?: or System Interface)?(?:\])?.*?\n/i;
    const hldStart = /##\s*(?:\[)?High-Level Design(?:\])?.*?\n/i;
    const deepDivesStart = /##\s*(?:\[)?Potential Deep Dives(?:\])?.*?\n/i;
    const whatExpectedStart = /##\s*(?:\[)?What is Expected at Each Level\??(?:\])?.*?\n/i;

    return {
      1: extractSection(markdown, reqStart, nonReqStart),
      2: extractSection(markdown, nonReqStart, /(?:##\s+The Set Up)|(?:###\s*(?:\[)?Defining the Core Entities(?:\])?)/i),
      3: extractSection(markdown, entitiesStart, apiStart),
      4: extractSection(markdown, apiStart, hldStart),
      5: extractSection(markdown, hldStart, deepDivesStart),
      6: extractSection(markdown, deepDivesStart, whatExpectedStart),
    };
  } catch (error) {
    console.error('Failed to resolve original solution sections:', error.message);
    return null;
  }
};

module.exports = {
  SD_SOLUTIONS_DIR,
  extractSection,
  getOriginalSolutionSectionsForQuestion,
};
