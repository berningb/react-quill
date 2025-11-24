/**
 * Utilities for tracking current formatting state
 * (what format/list the cursor is currently in)
 */

/**
 * Get the current format block (p, h1, h2, etc.)
 */
export function getCurrentFormat(editorElement) {
  let formatBlock = document.queryCommandValue('formatBlock');
  
  if (formatBlock) {
    return formatBlock.toLowerCase().replace(/<|>/g, '');
  }
  
  // Fallback: walk up the DOM tree to find format tag
  const sel = window.getSelection();
  if (sel && sel.anchorNode) {
    let node = sel.anchorNode.nodeType === 3 
      ? sel.anchorNode.parentElement 
      : sel.anchorNode;
    
    while (node && node !== editorElement) {
      const tagName = node.tagName?.toLowerCase();
      if (tagName && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        return tagName;
      }
      node = node.parentElement;
    }
  }
  
  return 'p'; // default
}

/**
 * Get the current list type (ul, ol, none)
 */
export function getCurrentListType() {
  const isInUL = document.queryCommandState('insertUnorderedList');
  const isInOL = document.queryCommandState('insertOrderedList');
  
  if (isInUL) return 'ul';
  if (isInOL) return 'ol';
  return 'none';
}

/**
 * Get active formatting states (bold, italic, underline)
 */
export function getActiveFormats() {
  return {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
  };
}

