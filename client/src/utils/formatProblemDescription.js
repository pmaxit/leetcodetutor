export const formatProblemDescription = (text) => {
  if (!text || typeof text !== 'string') return '';

  // Pattern to match section headers (works without newlines)
  const sectionPattern = /\b(Example \d+:|Input:|Output:|Explanation:|Constraints:|Follow-up:|Note:|Approach:|Time Complexity:|Space Complexity:)\s+/g;

  // Replace section headers with newline + bold header
  let formatted = text.replace(sectionPattern, '\n\n**$1** ');

  // Clean up multiple spaces
  formatted = formatted.replace(/\s+/g, ' ');

  // Clean up the spaces around newlines we just added
  formatted = formatted.replace(/\n\s+/g, '\n').replace(/\s+\n/g, '\n');

  return formatted.trim();
};
