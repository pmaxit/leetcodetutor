export const formatLeetcodeHTML = (html) => {
  if (!html || typeof html !== 'string') return html;

  let formatted = html;

  // Section header patterns to look for (both in <strong> and plain text)
  const headerPatterns = [
    { regex: /(<strong>\s*Example\s+\d+\s*<\/strong>)/gi, replacement: '</p>\n<p style="margin-top: 1.5rem; margin-bottom: 0.75rem;"><strong style="font-size: 1.05em;">$1</strong>' },
    { regex: /(<strong>\s*(Input|Output|Explanation|Constraints|Follow-up|Note|Approach)\s*<\/strong>)/gi, replacement: '</p>\n<p style="margin-top: 1.25rem; margin-bottom: 0.75rem;"><strong style="font-size: 1.02em;">$1</strong>' },
    { regex: /(<strong>\s*(Time|Space)\s+Complexity\s*<\/strong>)/gi, replacement: '</p>\n<p style="margin-top: 1.25rem; margin-bottom: 0.75rem;"><strong style="font-size: 1.02em;">$1</strong>' },
  ];

  headerPatterns.forEach(({ regex, replacement }) => {
    formatted = formatted.replace(regex, replacement);
  });

  // Clean up any double closing/opening tags
  formatted = formatted.replace(/<\/p>\s*<p>/g, '</p><p>');

  // Ensure proper paragraph wrapping
  if (!formatted.startsWith('<p')) {
    formatted = '<p>' + formatted;
  }
  if (!formatted.endsWith('</p>')) {
    formatted = formatted + '</p>';
  }

  // Remove any stray opening p tags at the beginning
  formatted = formatted.replace(/^<p>\s*<\/p>/g, '<p>');

  return formatted;
};
