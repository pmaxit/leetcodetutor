export const formatProblemDescription = (text) => {
  if (!text || typeof text !== 'string') return '';

  let formatted = text;

  // First, handle actual newlines by preserving them
  // Pattern to match section headers - both with and without newlines
  const headerPattern = /\b(Example \d+|Input|Output|Explanation|Constraints|Follow-up|Note|Approach|Time Complexity|Space Complexity)(\s*:)/gi;

  // Add newlines before section headers (even if they're inline)
  formatted = formatted.replace(headerPattern, '\n\n**$1:**');

  // Clean up multiple spaces while preserving newlines
  formatted = formatted.replace(/[ \t]+/g, ' ');

  // Remove spaces around newlines
  formatted = formatted.replace(/\n\s+/g, '\n').replace(/\s+\n/g, '\n');

  // Collapse excessive newlines (keep max 2)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
};
