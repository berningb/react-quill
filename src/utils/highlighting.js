/**
 * Highlights specified words in HTML content
 * Works by wrapping matching text in spans with a highlight class
 * @param {string} html - The HTML content to highlight
 * @param {string[]} words - Array of words to highlight (case-insensitive)
 * @param {string} highlightClass - CSS class to apply to highlighted words
 * @returns {string} - HTML with highlighted words wrapped in spans
 */
export function highlightWords(html, words = [], highlightClass = 'rte-highlight') {
  if (!words || words.length === 0 || !html) {
    return html;
  }

  // Filter out empty words
  const validWords = words.filter(w => w && w.trim().length > 0);
  if (validWords.length === 0) {
    return html;
  }

  // Use a simple regex-based approach that works in both browser and SSR
  // We'll process the HTML string directly, being careful not to break tags
  let result = html;

  // Sort words by length (longest first) to handle overlapping matches
  const sortedWords = [...validWords].sort((a, b) => b.length - a.length);

  sortedWords.forEach(word => {
    const escapedWord = escapeRegex(word.trim());
    // Match word boundaries, but be careful not to match inside HTML tags
    // This regex matches the word only when it's not inside angle brackets
    const regex = new RegExp(`(?![^<]*>)(\\b${escapedWord}\\b)`, 'gi');
    result = result.replace(regex, `<span class="${highlightClass}">$1</span>`);
  });

  return result;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

