import React from 'react';
import { getTextFromHtml } from '../utils/helpers';

export const CharCount = ({ mode, showPreview, state }) => {
  const charCount = mode === 'wysiwyg' || showPreview
    ? getTextFromHtml(state.html).length
    : mode === 'markdown' 
      ? state.markdown.length 
      : state.html.length;

  return (
    <div className="px-2 py-1 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
      <span className="text-xs text-gray-500">
        {charCount} chars
      </span>
    </div>
  );
};

