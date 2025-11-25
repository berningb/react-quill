import React, { useEffect, useRef } from 'react';
import { highlightWords } from '../utils/highlighting';

/**
 * Highlights words with different colors
 */
function highlightWordsMultiColor(html, wordColorMap) {
  if (!html || !wordColorMap || wordColorMap.length === 0) {
    return html;
  }

  let result = html;
  
  // Sort by word length (longest first) to handle overlapping
  const sorted = [...wordColorMap].sort((a, b) => b.word.length - a.word.length);
  
  sorted.forEach(({ word, color }) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?![^<]*>)(\\b${escapedWord}\\b)`, 'gi');
    
    // Support both hex colors (inline styles) and Tailwind classes
    if (color.hex) {
      // Use inline styles for hex colors
      const textColor = color.text || '#000000';
      result = result.replace(regex, `<span style="background-color: ${color.hex}; color: ${textColor};" class="px-0.5 rounded font-medium">$1</span>`);
    } else if (color.class) {
      // Use Tailwind classes
      result = result.replace(regex, `<span class="${color.class} ${color.text || ''} px-0.5 rounded font-medium">$1</span>`);
    } else {
      // Fallback to default highlight
      result = result.replace(regex, `<span class="bg-yellow-200 text-yellow-800 px-0.5 rounded font-medium">$1</span>`);
    }
  });
  
  return result;
}

export const MarkdownPreview = ({ html, highlightWords: wordsToHighlight = [], highlightWordColors = null, onWordClick = null, lineSpacing = null }) => {
  const previewRef = useRef(null);
  
  // Preserve the original HTML with all inline styles intact
  let highlightedHtml = html || '';
  
  // Use multi-color highlighting if wordColorMap is provided
  // Note: Highlighting functions preserve inline styles by only wrapping text content, not modifying style attributes
  if (highlightWordColors && highlightWordColors.length > 0) {
    highlightedHtml = highlightWordsMultiColor(html || '', highlightWordColors);
  } else if (wordsToHighlight && wordsToHighlight.length > 0) {
    // Fall back to single-color highlighting
    highlightedHtml = highlightWords(html || '', wordsToHighlight);
  }


  // Handle word clicks in preview mode
  useEffect(() => {
    if (!previewRef.current || !onWordClick) {
      return;
    }
    
    const handleClick = (event) => {
      const target = event.target;
      
      // Small delay to ensure selection is set
      setTimeout(() => {
        // If clicking on a highlighted span, extract word from its text
        if (target.tagName === 'SPAN' && target.textContent) {
          const text = target.textContent.trim();
          const wordMatch = text.match(/[\w'-]+/);
          if (wordMatch) {
            const clickedWord = wordMatch[0].replace(/^['-]+|['-]+$/g, '').toLowerCase().trim();
            if (clickedWord && clickedWord.length > 1) {
              onWordClick(clickedWord);
            }
            return;
          }
        }
        
        // Otherwise, use selection to find word
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }
        
        const range = selection.getRangeAt(0);
        let textNode = range.startContainer;
        let offset = range.startOffset;
        
        // If clicking on an element node, find the text node
        if (textNode.nodeType === Node.ELEMENT_NODE) {
          const walker = document.createTreeWalker(
            textNode,
            NodeFilter.SHOW_TEXT,
            null
          );
          textNode = walker.nextNode();
          if (!textNode) {
            return;
          }
          offset = 0;
        }
        
        if (textNode.nodeType !== Node.TEXT_NODE) {
          return;
        }
        
        const text = textNode.textContent || '';
        
        // Extract word boundaries
        const beforeCursor = text.substring(0, offset);
        const afterCursor = text.substring(offset);
        
        const beforeMatch = beforeCursor.match(/[\w'-]+$/);
        const afterMatch = afterCursor.match(/^[\w'-]+/);
        
        const wordBefore = beforeMatch ? beforeMatch[0] : '';
        const wordAfter = afterMatch ? afterMatch[0] : '';
        
        const clickedWord = (wordBefore + wordAfter).replace(/^['-]+|['-]+$/g, '').toLowerCase().trim();
        
        if (clickedWord && clickedWord.length > 1) {
          onWordClick(clickedWord);
        }
      }, 10);
    };
    
    // Use capture phase to catch events before they bubble
    previewRef.current.addEventListener('click', handleClick, true);
    
    return () => {
      if (previewRef.current) {
        previewRef.current.removeEventListener('click', handleClick, true);
      }
    };
  }, [previewRef, html, onWordClick]);

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <div 
        ref={previewRef}
        className="p-5 outline-none text-base bg-white [&_h1]:text-3xl [&_h1]:my-3 [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:my-3 [&_h2]:font-bold [&_h3]:text-xl [&_h3]:my-3 [&_h3]:font-bold [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-8 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-8 [&_ol]:list-decimal [&_li]:my-1 [&_li]:ml-4 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-blue-500 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_.rte-highlight]:bg-yellow-200 [&_.rte-highlight]:px-0.5 [&_.rte-highlight]:rounded cursor-pointer" 
        style={{ '--editor-line-height': lineSpacing || '1.5', lineHeight: lineSpacing || '1.5' }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
      />
    </div>
  );
};

