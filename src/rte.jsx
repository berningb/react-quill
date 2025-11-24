import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { htmlToMarkdown, markdownToHtml } from './utils/markdown';
import { getCurrentFormat, getCurrentListType, getActiveFormats } from './utils/formatTracking';
import { Toolbar } from './components/Toolbar';
import { EditorView } from './components/EditorView';
import { CharCount } from './components/CharCount';

export const RichTextEditor = ({
  placeholder = 'Start typing...',
  initialContent = '',
  onChange,
  initialMode = 'wysiwyg',
  hideModeSwitcher = false,
  highlightWords = [],
  highlightWordColors = null,
  onWordClick = null
}) => {
  // Refs for editor elements
  const editorRef = useRef(null);
  const markdownRef = useRef(null);
  const htmlRef = useRef(null);
  
  // Editor state
  const [mode, setMode] = useState(initialMode);
  const [showPreview, setShowPreview] = useState(false);
  
  const [state, setState] = useState({
    content: initialContent,
    html: initialContent,
    selection: null,
    markdown: htmlToMarkdown(initialContent),
  });

  // Track active formatting states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Track current format states
  const [currentFormat, setCurrentFormat] = useState('p');
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [currentList, setCurrentList] = useState('none');
  const [currentLineSpacing, setCurrentLineSpacing] = useState('1.5');

  // Helper: Update all state and format tracking (DRY - used in 3 places)
  const updateEditorState = useCallback(() => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const text = editorRef.current.textContent || '';
    const markdown = htmlToMarkdown(html);

    // Update content state
    setState(prev => ({
      ...prev,
      html,
      content: text,
      markdown,
    }));

    // Update formatting state
    const formats = getActiveFormats();
    setActiveFormats({
      bold: formats.bold,
      italic: formats.italic,
      underline: formats.underline,
    });

    setCurrentFormat(getCurrentFormat(editorRef.current));
    setCurrentList(getCurrentListType());

    // Notify parent
    if (onChange) {
      onChange(text, html, markdown);
    }
  }, [onChange]);

  // Execute document command
  const execCommand = useCallback((command, value) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateEditorState();
    }
  }, [updateEditorState]);

  // Handle format dropdown change
  const handleFormatChange = useCallback((event) => {
    const format = event.target.value;
    setCurrentFormat(format);
    execCommand('formatBlock', format);
  }, [execCommand]);

  // Handle list dropdown change
  const handleListChange = useCallback((event) => {
    const listType = event.target.value;
    
    const isInUL = document.queryCommandState('insertUnorderedList');
    const isInOL = document.queryCommandState('insertOrderedList');
    
    if (listType === 'none') {
      if (isInUL) execCommand('insertUnorderedList');
      if (isInOL) execCommand('insertOrderedList');
      setCurrentList('none');
    } else if (listType === 'ul') {
      if (isInOL) execCommand('insertOrderedList');
      if (!isInUL) execCommand('insertUnorderedList');
      setCurrentList('ul');
    } else if (listType === 'ol') {
      if (isInUL) execCommand('insertUnorderedList');
      if (!isInOL) execCommand('insertOrderedList');
      setCurrentList('ol');
    }
  }, [execCommand]);

  // Handle alignment dropdown change
  const handleAlignmentChange = useCallback((event) => {
    const alignment = event.target.value;
    setCurrentAlignment(alignment);
    
    if (alignment === 'left') execCommand('justifyLeft');
    else if (alignment === 'center') execCommand('justifyCenter');
    else if (alignment === 'right') execCommand('justifyRight');
    else if (alignment === 'justify') execCommand('justifyFull');
  }, [execCommand]);

  // Handle line spacing change
  const handleLineSpacingChange = useCallback((event) => {
    const lineSpacing = event.target.value;
    setCurrentLineSpacing(lineSpacing);
    
    if (editorRef.current) {
      // Apply line-height using CSS custom property and inline style
      editorRef.current.style.setProperty('--editor-line-height', lineSpacing);
      editorRef.current.style.lineHeight = lineSpacing;
      
      // Force line-height on all elements to ensure inheritance works
      // This is critical for pasted content that might have its own styles
      const allElements = editorRef.current.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove any existing line-height from style object
        if (el.style.lineHeight) {
          el.style.lineHeight = '';
        }
        // Remove from style attribute
        if (el.hasAttribute('style')) {
          const style = el.getAttribute('style');
          if (style) {
            const cleaned = style.replace(/line-height\s*:\s*[^;]+;?/gi, '').trim();
            if (cleaned) {
              el.setAttribute('style', cleaned);
            } else {
              el.removeAttribute('style');
            }
          }
        }
        // Force inheritance - set to empty string so it inherits from parent
        el.style.lineHeight = '';
        // Use CSS to force inheritance
        el.style.setProperty('line-height', 'inherit', 'important');
      });
      
      // Use a small delay to ensure DOM has updated, then verify
      requestAnimationFrame(() => {
        if (editorRef.current) {
          // Double-check the editor container has the line-height
          editorRef.current.style.setProperty('--editor-line-height', lineSpacing);
          editorRef.current.style.lineHeight = lineSpacing;
          updateEditorState();
        }
      });
      
      updateEditorState();
    }
  }, [updateEditorState]);

  // Handle paste events - remove background colors from pasted HTML
  const handlePaste = useCallback((event) => {
    if (!editorRef.current || mode !== 'wysiwyg') return;
    
    event.preventDefault();
    
    const clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    let pastedHtml = clipboardData.getData('text/html');
    const pastedText = clipboardData.getData('text/plain');
    
    // If HTML is available, clean it; otherwise use plain text
    if (pastedHtml) {
      // Create a temporary div to parse and clean the HTML
      const temp = document.createElement('div');
      temp.innerHTML = pastedHtml;
      
      // Remove background-color and line-height from all elements and text nodes' parent elements
      const allElements = temp.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove inline background-color styles
        if (el.style.backgroundColor) {
          el.style.backgroundColor = '';
        }
        if (el.style.background) {
          el.style.background = '';
        }
        
        // Remove line-height from pasted elements (we'll use the editor's line spacing)
        if (el.style.lineHeight) {
          el.style.lineHeight = '';
        }
        
        // Remove padding and margin that might interfere with line spacing
        if (el.style.padding) {
          el.style.padding = '';
        }
        if (el.style.paddingTop) {
          el.style.paddingTop = '';
        }
        if (el.style.paddingBottom) {
          el.style.paddingBottom = '';
        }
        if (el.style.paddingLeft) {
          el.style.paddingLeft = '';
        }
        if (el.style.paddingRight) {
          el.style.paddingRight = '';
        }
        if (el.style.margin) {
          el.style.margin = '';
        }
        if (el.style.marginTop) {
          el.style.marginTop = '';
        }
        if (el.style.marginBottom) {
          el.style.marginBottom = '';
        }
        if (el.style.marginLeft) {
          el.style.marginLeft = '';
        }
        if (el.style.marginRight) {
          el.style.marginRight = '';
        }
        
        // Clean style attribute more thoroughly
        if (el.hasAttribute('style')) {
          const style = el.getAttribute('style');
          if (style) {
            // Remove all background-related CSS properties, line-height, padding, and margin
            const cleanedStyle = style
              .replace(/background-color\s*:\s*[^;]+;?/gi, '')
              .replace(/background\s*:\s*[^;]+;?/gi, '')
              .replace(/background-image\s*:\s*[^;]+;?/gi, '')
              .replace(/background-position\s*:\s*[^;]+;?/gi, '')
              .replace(/background-repeat\s*:\s*[^;]+;?/gi, '')
              .replace(/background-size\s*:\s*[^;]+;?/gi, '')
              .replace(/background-attachment\s*:\s*[^;]+;?/gi, '')
              .replace(/line-height\s*:\s*[^;]+;?/gi, '') // Remove line-height
              .replace(/padding\s*:\s*[^;]+;?/gi, '') // Remove padding
              .replace(/padding-top\s*:\s*[^;]+;?/gi, '')
              .replace(/padding-bottom\s*:\s*[^;]+;?/gi, '')
              .replace(/padding-left\s*:\s*[^;]+;?/gi, '')
              .replace(/padding-right\s*:\s*[^;]+;?/gi, '')
              .replace(/margin\s*:\s*[^;]+;?/gi, '') // Remove margin
              .replace(/margin-top\s*:\s*[^;]+;?/gi, '')
              .replace(/margin-bottom\s*:\s*[^;]+;?/gi, '')
              .replace(/margin-left\s*:\s*[^;]+;?/gi, '')
              .replace(/margin-right\s*:\s*[^;]+;?/gi, '')
              .replace(/;\s*;/g, ';') // Remove double semicolons
              .replace(/^\s*;\s*|\s*;\s*$/g, '') // Remove leading/trailing semicolons
              .trim();
            if (cleanedStyle) {
              el.setAttribute('style', cleanedStyle);
            } else {
              el.removeAttribute('style');
            }
          }
        }
        
        // Remove bgcolor attribute if present
        if (el.hasAttribute('bgcolor')) {
          el.removeAttribute('bgcolor');
        }
        
        // Remove background-related classes (common in pasted content)
        if (el.className) {
          const classes = el.className.split(/\s+/).filter(cls => {
            // Remove classes that might contain background colors, padding, or margin
            return !cls.match(/^(bg-|background|highlight|hl-|mark|p-|m-|padding|margin)/i);
          });
          if (classes.length > 0) {
            el.className = classes.join(' ');
          } else {
            el.removeAttribute('class');
          }
        }
      });
      
      // Also process text nodes' parent elements (in case they have background styles, line-height, padding, or margin)
      const walker = document.createTreeWalker(
        temp,
        NodeFilter.SHOW_TEXT,
        null
      );
      let textNode;
      while (textNode = walker.nextNode()) {
        const parent = textNode.parentElement;
        if (parent && parent !== temp) {
          if (parent.style.backgroundColor || parent.style.background) {
            parent.style.backgroundColor = '';
            parent.style.background = '';
          }
          if (parent.style.lineHeight) {
            parent.style.lineHeight = '';
          }
          if (parent.style.padding || parent.style.paddingTop || parent.style.paddingBottom) {
            parent.style.padding = '';
            parent.style.paddingTop = '';
            parent.style.paddingBottom = '';
          }
          if (parent.style.margin || parent.style.marginTop || parent.style.marginBottom) {
            parent.style.margin = '';
            parent.style.marginTop = '';
            parent.style.marginBottom = '';
          }
        }
      }
      
      pastedHtml = temp.innerHTML;
    }
    
    // Insert the cleaned content
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      if (pastedHtml) {
        const temp = document.createElement('div');
        temp.innerHTML = pastedHtml;
        const fragment = document.createDocumentFragment();
        while (temp.firstChild) {
          fragment.appendChild(temp.firstChild);
        }
        range.insertNode(fragment);
      } else if (pastedText) {
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
      }
      
      // Move cursor to end of inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Update editor state and clean up any remaining background colors
    updateEditorState();
    
    // Final cleanup pass - remove any background colors, line-height, padding, and margin that might have slipped through
    if (editorRef.current) {
      requestAnimationFrame(() => {
        if (!editorRef.current) return;
        const allElements = editorRef.current.querySelectorAll('*');
        allElements.forEach(el => {
          // Remove background colors
          if (el.style.backgroundColor || el.style.background) {
            el.style.backgroundColor = '';
            el.style.background = '';
          }
          // Remove line-height, padding, and margin from child elements (editor container has the line spacing)
          if (el !== editorRef.current) {
            if (el.style.lineHeight) {
              el.style.lineHeight = '';
            }
            if (el.style.padding || el.style.paddingTop || el.style.paddingBottom) {
              el.style.padding = '';
              el.style.paddingTop = '';
              el.style.paddingBottom = '';
              el.style.paddingLeft = '';
              el.style.paddingRight = '';
            }
            if (el.style.margin || el.style.marginTop || el.style.marginBottom) {
              el.style.margin = '';
              el.style.marginTop = '';
              el.style.marginBottom = '';
              el.style.marginLeft = '';
              el.style.marginRight = '';
            }
          }
          const style = el.getAttribute('style');
          if (style && (style.includes('background') || style.includes('bgcolor') || style.includes('line-height') || style.includes('padding') || style.includes('margin'))) {
            const cleaned = style
              .replace(/background[^:]*:\s*[^;]+;?/gi, '')
              .replace(/bgcolor[^:]*:\s*[^;]+;?/gi, '')
              .replace(/line-height\s*:\s*[^;]+;?/gi, '') // Remove line-height
              .replace(/padding[^:]*:\s*[^;]+;?/gi, '') // Remove padding
              .replace(/margin[^:]*:\s*[^;]+;?/gi, '') // Remove margin
              .trim();
            if (cleaned) {
              el.setAttribute('style', cleaned);
            } else {
              el.removeAttribute('style');
            }
          }
        });
        // Ensure editor's line spacing is still applied
        if (currentLineSpacing && editorRef.current) {
          editorRef.current.style.lineHeight = currentLineSpacing;
        }
        updateEditorState();
      });
    }
  }, [mode, updateEditorState, currentLineSpacing]);

  // Handle content changes
  const handleInput = useCallback(() => {
    updateEditorState();
  }, [updateEditorState]);

  // Handle selection changes
  const handleSelect = useCallback(() => {
    if (editorRef.current) {
      // Track selection range
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setState(prev => ({
          ...prev,
          selection: {
            start: range.startOffset,
            end: range.endOffset,
          },
        }));
      }
      
      updateEditorState();
    }
  }, [updateEditorState]);

  // Handle markdown textarea changes
  const handleMarkdownInput = useCallback(() => {
    if (markdownRef.current) {
      const markdown = markdownRef.current.value;
      const html = markdownToHtml(markdown);
      const text = markdownRef.current.value;
      
      setState(prev => ({
        ...prev,
        html,
        content: text,
        markdown,
      }));
      
      if (onChange) {
        onChange(text, html, markdown);
      }
    }
  }, [onChange]);

  // Handle HTML textarea changes
  const handleHTMLInput = useCallback(() => {
    if (htmlRef.current) {
      const html = htmlRef.current.value;
      const markdown = htmlToMarkdown(html);
      const text = htmlRef.current.value.replace(/<[^>]*>/g, '');
      
      setState(prev => ({
        ...prev,
        html,
        content: text,
        markdown,
      }));
      
      if (onChange) {
        onChange(text, html, markdown);
      }
    }
  }, [onChange]);

  // Toggle between modes
  const toggleMode = useCallback((action) => {
    if (action === 'preview') {
      setShowPreview(prev => !prev);
      return;
    }
    
    // Cycle through modes: wysiwyg -> markdown -> html -> wysiwyg
    if (mode === 'wysiwyg' && editorRef.current) {
      const html = editorRef.current.innerHTML;
      setState(prev => ({
        ...prev,
        html,
        markdown: htmlToMarkdown(html),
      }));
      setMode('markdown');
    } else if (mode === 'markdown' && markdownRef.current) {
      const markdown = markdownRef.current.value;
      setState(prev => ({
        ...prev,
        markdown,
        html: markdownToHtml(markdown),
      }));
      setMode('html');
    } else if (mode === 'html' && htmlRef.current) {
      const html = htmlRef.current.value;
      setState(prev => ({
        ...prev,
        html,
        markdown: htmlToMarkdown(html),
      }));
      setMode('wysiwyg');
    }
    
    setShowPreview(false);
  }, [mode]);
  
  // Track previous mode to detect mode changes
  const prevModeRef = useRef(mode);
  
  // Sync content when mode changes (not on every state.html change)
  useEffect(() => {
    if (mode === 'wysiwyg' && editorRef.current && state.html) {
      // Only update if mode actually changed, not on every state update
      if (prevModeRef.current !== mode) {
        editorRef.current.innerHTML = state.html;
        // Apply line spacing when switching to WYSIWYG mode
        if (currentLineSpacing) {
          editorRef.current.style.lineHeight = currentLineSpacing;
        }
        prevModeRef.current = mode;
      }
    } else {
      prevModeRef.current = mode;
    }
  }, [mode, currentLineSpacing]); // Removed state.html from dependencies

  // Track previous preview state
  const prevPreviewRef = useRef(showPreview);
  
  // Sync content when preview is toggled off (restore editor content)
  useEffect(() => {
    // Only sync when preview state actually changes (turned off), not on every state.html change
    if (prevPreviewRef.current !== showPreview && !showPreview && mode === 'wysiwyg' && editorRef.current && state.html) {
      // Only update if content is different to avoid cursor issues
      if (editorRef.current.innerHTML !== state.html) {
        editorRef.current.innerHTML = state.html;
      }
      prevPreviewRef.current = showPreview;
    } else if (prevPreviewRef.current !== showPreview) {
      prevPreviewRef.current = showPreview;
    }
  }, [showPreview, mode]); // Removed state.html from dependencies

  // Track if editor has been initialized to prevent resets during typing
  const initializedRef = useRef(false);
  const initialContentRef = useRef(initialContent);
  
  // Update ref when initialContent changes (for new files)
  useEffect(() => {
    if (initialContent !== initialContentRef.current) {
      initializedRef.current = false;
      initialContentRef.current = initialContent;
    }
  }, [initialContent]);
  
  // Initialize editor with content - only once per initialContent value
  useEffect(() => {
    if (!initializedRef.current && initialContent) {
      if (editorRef.current && mode === 'wysiwyg') {
        // Only set if editor is empty or content is different
        if (!editorRef.current.innerHTML || editorRef.current.innerHTML !== initialContent) {
          editorRef.current.innerHTML = initialContent;
          setState(prev => ({
            ...prev,
            content: editorRef.current.textContent || '',
            html: initialContent,
            markdown: htmlToMarkdown(initialContent),
          }));
        }
      }
      
      if (markdownRef.current && mode === 'markdown') {
        const newMarkdown = htmlToMarkdown(initialContent);
        if (markdownRef.current.value !== newMarkdown) {
          markdownRef.current.value = newMarkdown;
          setState(prev => ({
            ...prev,
            markdown: newMarkdown,
            html: initialContent,
          }));
        }
      }
      
      if (htmlRef.current && mode === 'html') {
        if (htmlRef.current.value !== initialContent) {
          htmlRef.current.value = initialContent;
          setState(prev => ({
            ...prev,
            html: initialContent,
            markdown: htmlToMarkdown(initialContent),
          }));
        }
      }
      
      initializedRef.current = true;
    }
  }, [initialContent, mode]);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden flex flex-col w-full h-full">
      <Toolbar
        mode={mode}
        showPreview={showPreview}
        hideModeSwitcher={hideModeSwitcher}
        activeFormats={activeFormats}
        currentFormat={currentFormat}
        currentList={currentList}
        currentAlignment={currentAlignment}
        currentLineSpacing={currentLineSpacing}
        execCommand={execCommand}
        handleFormatChange={handleFormatChange}
        handleListChange={handleListChange}
        handleAlignmentChange={handleAlignmentChange}
        handleLineSpacingChange={handleLineSpacingChange}
        toggleMode={toggleMode}
      />

      <EditorView
        mode={mode}
        showPreview={showPreview}
        placeholder={placeholder}
        editorRef={editorRef}
        markdownRef={markdownRef}
        htmlRef={htmlRef}
        state={state}
        handleInput={handleInput}
        handleSelect={handleSelect}
        handleMarkdownInput={handleMarkdownInput}
        handleHTMLInput={handleHTMLInput}
        handlePaste={handlePaste}
        highlightWords={highlightWords}
        highlightWordColors={highlightWordColors}
        onWordClick={onWordClick}
        lineSpacing={currentLineSpacing}
      />

      <CharCount
        mode={mode}
        showPreview={showPreview}
        state={state}
      />
    </div>
  );
};

