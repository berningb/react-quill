// Helper function to get accurate character count from HTML
export const getTextFromHtml = (html) => {
  // Create a temporary div to parse HTML and get text content
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback: strip HTML tags
  return html.replace(/<[^>]*>/g, '');
};

