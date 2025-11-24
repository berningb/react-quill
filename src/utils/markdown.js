/**
 * Simple HTML to Markdown converter with custom extensions
 * Custom syntax:
 * - ==text== for underline
 * - {>} at line start for right align
 * - {^} at line start for center align  
 * - {=} at line start for justify
 */
export function htmlToMarkdown(html) {
  let markdown = html;

  // Process alignment on block elements FIRST (before converting to markdown)
  // Right align
  markdown = markdown.replace(/<(h[1-6]|p|div)[^>]*style=["'][^"']*text-align:\s*right[^"']*["'][^>]*>(.*?)<\/\1>/gi, (match, tag, content) => {
    return `{>}${match}`;
  });
  // Center align
  markdown = markdown.replace(/<(h[1-6]|p|div)[^>]*style=["'][^"']*text-align:\s*center[^"']*["'][^>]*>(.*?)<\/\1>/gi, (match, tag, content) => {
    return `{^}${match}`;
  });
  // Justify
  markdown = markdown.replace(/<(h[1-6]|p|div)[^>]*style=["'][^"']*text-align:\s*justify[^"']*["'][^>]*>(.*?)<\/\1>/gi, (match, tag, content) => {
    return `{=}${match}`;
  });

  // Headers (preserve alignment markers)
  markdown = markdown.replace(/(\{[>^=]\})?<h1[^>]*>(.*?)<\/h1>/gi, (match, align, content) => {
    return (align || '') + '# ' + content + '\n\n';
  });
  markdown = markdown.replace(/(\{[>^=]\})?<h2[^>]*>(.*?)<\/h2>/gi, (match, align, content) => {
    return (align || '') + '## ' + content + '\n\n';
  });
  markdown = markdown.replace(/(\{[>^=]\})?<h3[^>]*>(.*?)<\/h3>/gi, (match, align, content) => {
    return (align || '') + '### ' + content + '\n\n';
  });
  markdown = markdown.replace(/(\{[>^=]\})?<h4[^>]*>(.*?)<\/h4>/gi, (match, align, content) => {
    return (align || '') + '#### ' + content + '\n\n';
  });
  markdown = markdown.replace(/(\{[>^=]\})?<h5[^>]*>(.*?)<\/h5>/gi, (match, align, content) => {
    return (align || '') + '##### ' + content + '\n\n';
  });
  markdown = markdown.replace(/(\{[>^=]\})?<h6[^>]*>(.*?)<\/h6>/gi, (match, align, content) => {
    return (align || '') + '###### ' + content + '\n\n';
  });

  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Underline (custom syntax: ==text==)
  markdown = markdown.replace(/<u[^>]*>(.*?)<\/u>/gi, '==$1==');

  // Lists - preserve inline formatting
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map((item) => {
      // Extract text but keep inline tags for now
      let text = item.replace(/<\/?li[^>]*>/gi, '').trim();
      return `- ${text}`;
    }).join('\n') + '\n\n';
  });

  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map((item, index) => {
      // Extract text but keep inline tags for now
      let text = item.replace(/<\/?li[^>]*>/gi, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n\n';
  });

  // Paragraphs (preserve alignment markers)
  markdown = markdown.replace(/(\{[>^=]\})?<p[^>]*>(.*?)<\/p>/gi, (match, align, content) => {
    return (align || '') + content + '\n\n';
  });

  // Line breaks - convert to single newline
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Clean up excessive newlines (but preserve double newlines for paragraphs)
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  // Trim leading and trailing whitespace
  markdown = markdown.trim();

  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');

  return markdown.trim();
}

/**
 * Simple Markdown to HTML converter with custom extensions
 * Custom syntax:
 * - ==text== for underline
 * - {>} at line start for right align
 * - {^} at line start for center align
 * - {=} at line start for justify
 */
export function markdownToHtml(markdown) {
  let html = markdown;

  // Don't escape HTML entities or Unicode characters
  // Markdown contains raw text with Unicode characters (like em dashes —)
  // We should preserve these as-is and only convert markdown syntax to HTML
  // No HTML escaping needed - the browser will handle Unicode correctly

  // Process alignment markers BEFORE other conversions
  // Right align
  html = html.replace(/^\{&gt;\}(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level} style="text-align: right">${content}</h${level}>`;
  });
  html = html.replace(/^\{&gt;\}(.+)$/gm, '<p style="text-align: right">$1</p>');
  
  // Center align
  html = html.replace(/^\{\^\}(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level} style="text-align: center">${content}</h${level}>`;
  });
  html = html.replace(/^\{\^\}(.+)$/gm, '<p style="text-align: center">$1</p>');
  
  // Justify
  html = html.replace(/^\{=\}(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level} style="text-align: justify">${content}</h${level}>`;
  });
  html = html.replace(/^\{=\}(.+)$/gm, '<p style="text-align: justify">$1</p>');

  // Headers (must be done before other replacements) - only if not already converted by alignment
  html = html.replace(/^######\s+(.+)$/gm, (match, content) => {
    return match.includes('<h6') ? match : `<h6>${content}</h6>`;
  });
  html = html.replace(/^#####\s+(.+)$/gm, (match, content) => {
    return match.includes('<h5') ? match : `<h5>${content}</h5>`;
  });
  html = html.replace(/^####\s+(.+)$/gm, (match, content) => {
    return match.includes('<h4') ? match : `<h4>${content}</h4>`;
  });
  html = html.replace(/^###\s+(.+)$/gm, (match, content) => {
    return match.includes('<h3') ? match : `<h3>${content}</h3>`;
  });
  html = html.replace(/^##\s+(.+)$/gm, (match, content) => {
    return match.includes('<h2') ? match : `<h2>${content}</h2>`;
  });
  html = html.replace(/^#\s+(.+)$/gm, (match, content) => {
    return match.includes('<h1') ? match : `<h1>${content}</h1>`;
  });

  // Bold (must be before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Underline (custom syntax: ==text==)
  html = html.replace(/==(.+?)==/g, '<u>$1</u>');

  // Unordered lists
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ol> if they're not already wrapped
  html = html.replace(/(<li>(?:(?!<ul>).)*<\/li>(?:\s*<li>(?:(?!<ul>).)*<\/li>)*)/gs, (match) => {
    if (!match.includes('<ul>')) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });
  html = html.replace(/<\/ol>\s*<ol>/g, '');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Paragraphs (double newline = new paragraph)
  html = html.split(/\n\n+/).map(para => {
    // Remove any leading/trailing whitespace
    para = para.trim();
    
    // Skip empty paragraphs
    if (!para) {
      return '';
    }
    
    // Don't wrap if already has block-level tags or is already a paragraph with style
    if (para.match(/^<(h[1-6]|ul|ol|li|div|blockquote|p)/)) {
      return para;
    }
    
    // Don't wrap if it's just a single line break or whitespace
    if (para.match(/^[\s\n]*$/)) {
      return '';
    }
    
    return `<p>${para}</p>`;
  }).filter(p => p).join('');

  return html;
}

