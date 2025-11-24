import React from 'react';
import { MarkdownPreview } from './MarkdownPreview';

export const EditorView = ({
  mode,
  showPreview,
  placeholder,
  editorRef,
  markdownRef,
  htmlRef,
  state,
  handleInput,
  handleSelect,
  handleMarkdownInput,
  handleHTMLInput,
  handlePaste,
  highlightWords,
  highlightWordColors,
  onWordClick,
  lineSpacing,
  getCurrentHtml,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {mode === 'wysiwyg' ? (
        <>
          {!showPreview ? (
            <div className="flex-1 overflow-auto min-h-0">
              <div
                ref={editorRef}
                className="p-5 outline-none text-base empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:italic focus:bg-gray-50 [&_h1]:text-3xl [&_h1]:my-3 [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:my-3 [&_h2]:font-bold [&_h3]:text-xl [&_h3]:my-3 [&_h3]:font-bold [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-8 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-8 [&_ol]:list-decimal [&_li]:my-1 [&_li]:ml-4 [&_strong]:font-bold [&_em]:italic [&_u]:underline"
                style={{ '--editor-line-height': lineSpacing || '1.5', lineHeight: lineSpacing || '1.5' }}
                contentEditable="true"
                data-placeholder={placeholder}
                onInput={handleInput}
                onPaste={handlePaste}
                onMouseUp={handleSelect}
                onKeyUp={handleSelect}
              />
            </div>
          ) : (
            <MarkdownPreview html={state.html} highlightWords={highlightWords} highlightWordColors={highlightWordColors} onWordClick={onWordClick} lineSpacing={lineSpacing} />
          )}
        </>
      ) : mode === 'markdown' ? (
        <>
          {!showPreview ? (
            <textarea
              ref={markdownRef}
              className="flex-1 p-5 font-mono text-sm leading-relaxed border-none outline-none resize-none bg-gray-50 text-gray-800 w-full focus:bg-white min-h-0"
              placeholder="Type markdown here..."
              value={state.markdown}
              onChange={handleMarkdownInput}
              onKeyUp={handleMarkdownInput}
            />
          ) : (
            <MarkdownPreview html={state.html} highlightWords={highlightWords} highlightWordColors={highlightWordColors} onWordClick={onWordClick} />
          )}
        </>
      ) : (
        <>
          {!showPreview ? (
            <textarea
              ref={htmlRef}
              className="flex-1 p-5 font-mono text-sm leading-relaxed border-none outline-none resize-none bg-gray-50 text-gray-800 w-full focus:bg-white min-h-0"
              placeholder="Type HTML here..."
              value={state.html}
              onChange={handleHTMLInput}
              onKeyUp={handleHTMLInput}
            />
          ) : (
            <MarkdownPreview html={state.html} highlightWords={highlightWords} highlightWordColors={highlightWordColors} onWordClick={onWordClick} />
          )}
        </>
      )}
    </div>
  );
};

