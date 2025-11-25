import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  onWordClick = null,
  forcePreview = null,
  onPreviewChange = null
}) => {
  // Refs for editor elements
  const editorRef = useRef(null);
  const markdownRef = useRef(null);
  const htmlRef = useRef(null);
  
  // Editor state
  const [mode, setMode] = useState(initialMode);
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle external preview control
  useEffect(() => {
    if (forcePreview !== null) {
      setShowPreview(forcePreview);
    }
  }, [forcePreview]);
  
  // Notify parent of preview state changes
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(showPreview);
    }
  }, [showPreview, onPreviewChange]);
  
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

  // Helper: Get current HTML directly from DOM
  const getCurrentHtml = useCallback(() => {
    if (mode === 'wysiwyg' && editorRef.current) {
      // Use innerHTML for consistency with handleInput
      const html = editorRef.current.innerHTML;
      return html;
    }
    return state.html;
  }, [mode, state.html]);

  // Helper: Update state (only when necessary, not on every keystroke)
  const updateEditorState = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.textContent || '';
    const markdown = htmlToMarkdown(html);

    setState(prev => ({
      ...prev,
      html: mode === 'wysiwyg' ? prev.html : html, // Don't update html in wysiwyg - read from DOM
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
  }, [onChange, mode]);

  // Execute document command
  const execCommand = useCallback((command, value) => {
    if (!editorRef.current) return;
    
    document.execCommand(command, false, value);
    editorRef.current.focus();
    
    requestAnimationFrame(() => {
      if (editorRef.current) {
        updateEditorState();
      }
    });
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
      editorRef.current.style.setProperty('--editor-line-height', lineSpacing);
      editorRef.current.style.lineHeight = lineSpacing;
    }
  }, []);

  // Handle paste events - clean pasted content
  const handlePaste = useCallback((event) => {
    if (!editorRef.current || mode !== 'wysiwyg') return;
    
    event.preventDefault();
    
    const clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    
    let pastedHtml = clipboardData.getData('text/html');
    const pastedText = clipboardData.getData('text/plain');
    
    if (pastedHtml) {
      const temp = document.createElement('div');
      temp.innerHTML = pastedHtml;
      
      // Remove background colors and unwanted styles from pasted content
      const allElements = temp.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.style.backgroundColor) el.style.backgroundColor = '';
        if (el.style.background) el.style.background = '';
        
        // Clean style attribute
        if (el.hasAttribute('style')) {
          const style = el.getAttribute('style');
          if (style) {
            const cleaned = style
              .replace(/background[^:]*:\s*[^;]+;?/gi, '')
              .replace(/bgcolor[^:]*:\s*[^;]+;?/gi, '')
              .trim();
            if (cleaned) {
              el.setAttribute('style', cleaned);
            } else {
              el.removeAttribute('style');
            }
          }
        }
        
        if (el.hasAttribute('bgcolor')) {
          el.removeAttribute('bgcolor');
        }
      });
      
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
      
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Update state after paste
    requestAnimationFrame(() => {
      if (editorRef.current) {
        updateEditorState();
      }
    });
  }, [mode, updateEditorState]);

  // Handle content changes - minimal updates
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const html = editorRef.current.innerHTML;
      setState(prev => ({ 
        ...prev, 
        content: text,
        html: html, // Keep state.html in sync for preview
      }));
      
      // Notify parent with HTML from DOM
      if (onChange) {
        onChange(text, html, htmlToMarkdown(html));
      }
    }
  }, [onChange]);

  // Handle selection changes
  const handleSelect = useCallback(() => {
    if (editorRef.current) {
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
    }
  }, []);

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
      // When toggling preview ON, capture the current HTML from the editor
      if (!showPreview && editorRef.current && mode === 'wysiwyg') {
        const html = getCurrentHtml();
        setState(prev => ({
          ...prev,
          html: html || prev.html,
        }));
      }
      
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
  }, [mode, showPreview, getCurrentHtml]);
  
  // Track previous mode
  const prevModeRef = useRef(mode);
  
  // Sync content when mode changes
  useEffect(() => {
    if (mode === 'wysiwyg' && editorRef.current && state.html && prevModeRef.current !== mode) {
      editorRef.current.innerHTML = state.html;
      if (currentLineSpacing) {
        editorRef.current.style.lineHeight = currentLineSpacing;
      }
      prevModeRef.current = mode;
    } else {
      prevModeRef.current = mode;
    }
  }, [mode, currentLineSpacing, state.html]);

  // Track previous showPreview state
  const prevShowPreviewRef = useRef(showPreview);
  
  // Restore HTML to editor when switching back from preview to edit
  useEffect(() => {
    // When switching from preview (true) to edit (false) in wysiwyg mode
    if (mode === 'wysiwyg' && prevShowPreviewRef.current === true && !showPreview && editorRef.current && state.html) {
      editorRef.current.innerHTML = state.html;
      if (currentLineSpacing) {
        editorRef.current.style.lineHeight = currentLineSpacing;
      }
    }
    prevShowPreviewRef.current = showPreview;
  }, [showPreview, mode, state.html, currentLineSpacing]);

  // Track if editor has been initialized
  const initializedRef = useRef(false);
  
  // Initialize editor with content
  useEffect(() => {
    if (!initializedRef.current && initialContent) {
      if (editorRef.current && mode === 'wysiwyg') {
        if (!editorRef.current.innerHTML || editorRef.current.innerHTML !== initialContent) {
          editorRef.current.innerHTML = initialContent;
          setState(prev => ({
            ...prev,
            content: editorRef.current.textContent || '',
            html: initialContent,
            markdown: htmlToMarkdown(initialContent),
          }));
          initializedRef.current = true;
        } else {
          initializedRef.current = true;
        }
      } else if (markdownRef.current && mode === 'markdown') {
        const newMarkdown = htmlToMarkdown(initialContent);
        markdownRef.current.value = newMarkdown;
        setState(prev => ({
          ...prev,
          markdown: newMarkdown,
          html: initialContent,
        }));
        initializedRef.current = true;
      } else if (htmlRef.current && mode === 'html') {
        htmlRef.current.value = initialContent;
        setState(prev => ({
          ...prev,
          html: initialContent,
          markdown: htmlToMarkdown(initialContent),
        }));
        initializedRef.current = true;
      } else {
        initializedRef.current = true;
      }
    }
  }, [initialContent, mode]);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden flex flex-col w-full h-full min-h-0">
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
        getCurrentHtml={getCurrentHtml}
      />

      <CharCount
        mode={mode}
        showPreview={showPreview}
        state={state}
      />
    </div>
  );
};
