import React from 'react';

export const Toolbar = ({
  mode,
  showPreview,
  hideModeSwitcher,
  activeFormats,
  currentFormat,
  currentList,
  currentAlignment,
  currentLineSpacing,
  execCommand,
  handleFormatChange,
  handleListChange,
  handleAlignmentChange,
  handleLineSpacingChange,
  toggleMode,
}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-b border-gray-200 justify-between shrink-0">
      {/* Left Side - Preview + WYSIWYG Controls */}
      <div className="flex items-center gap-1">
        {/* Preview Button - show in all modes */}
        <button
          className={`${showPreview ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-white text-gray-700 border-gray-300'} border rounded px-2 py-1 text-xs hover:bg-gray-100 transition-all duration-150 hover-lift`}
          onClick={() => toggleMode('preview')}
          title={showPreview ? 'Edit' : 'Preview'}
          type="button"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
        
        {mode === 'wysiwyg' && !showPreview && (
          <>
            {/* Text Formatting Buttons */}
            <button
              className={`${activeFormats.bold ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} border rounded px-2 py-1 font-bold text-xs hover:bg-gray-100 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => execCommand('bold')}
              title="Bold"
              type="button"
            >
              B
            </button>
            
            <button
              className={`${activeFormats.italic ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} border rounded px-2 py-1 italic text-xs hover:bg-gray-100 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => execCommand('italic')}
              title="Italic"
              type="button"
            >
              I
            </button>
            
            <button
              className={`${activeFormats.underline ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'} border rounded px-2 py-1 underline text-xs hover:bg-gray-100 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => execCommand('underline')}
              title="Underline"
              type="button"
            >
              U
            </button>

            {/* Format Dropdown */}
            <select
              className="bg-white border border-gray-300 rounded px-1 py-1 text-xs hover:bg-gray-100 text-gray-700 w-12 transition-all duration-150 cursor-pointer"
              onChange={handleFormatChange}
              value={currentFormat}
              title="Format"
            >
              <option value="p">P</option>
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>

            {/* List Dropdown */}
            <select
              className="bg-white border border-gray-300 rounded px-1 py-1 text-xs hover:bg-gray-100 text-gray-700 w-10 transition-all duration-150 cursor-pointer"
              onChange={handleListChange}
              value={currentList}
              title="List"
            >
              <option value="none">−</option>
              <option value="ul">•</option>
              <option value="ol">1.</option>
            </select>

            {/* Alignment Buttons */}
            <button
              className={`${currentAlignment === 'left' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300'} border rounded px-1 py-1 hover:bg-gray-100 text-gray-700 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => handleAlignmentChange({ target: { value: 'left' } })}
              title="Left"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="2" width="16" height="2" rx="0.5"/>
                <rect x="0" y="7" width="12" height="2" rx="0.5"/>
                <rect x="0" y="12" width="14" height="2" rx="0.5"/>
              </svg>
            </button>

            <button
              className={`${currentAlignment === 'center' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300'} border rounded px-1 py-1 hover:bg-gray-100 text-gray-700 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => handleAlignmentChange({ target: { value: 'center' } })}
              title="Center"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="2" width="16" height="2" rx="0.5"/>
                <rect x="2" y="7" width="12" height="2" rx="0.5"/>
                <rect x="1" y="12" width="14" height="2" rx="0.5"/>
              </svg>
            </button>

            <button
              className={`${currentAlignment === 'right' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300'} border rounded px-1 py-1 hover:bg-gray-100 text-gray-700 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => handleAlignmentChange({ target: { value: 'right' } })}
              title="Right"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="2" width="16" height="2" rx="0.5"/>
                <rect x="4" y="7" width="12" height="2" rx="0.5"/>
                <rect x="2" y="12" width="14" height="2" rx="0.5"/>
              </svg>
            </button>

            <button
              className={`${currentAlignment === 'justify' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300'} border rounded px-1 py-1 hover:bg-gray-100 text-gray-700 w-7 h-7 flex items-center justify-center transition-all duration-150 hover-lift`}
              onClick={() => handleAlignmentChange({ target: { value: 'justify' } })}
              title="Justify"
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="0" y="2" width="16" height="2" rx="0.5"/>
                <rect x="0" y="7" width="16" height="2" rx="0.5"/>
                <rect x="0" y="12" width="16" height="2" rx="0.5"/>
              </svg>
            </button>

            {/* Line Spacing Dropdown */}
            <select
              className="bg-white border border-gray-300 rounded px-1 py-1 text-xs hover:bg-gray-100 text-gray-700 w-14 transition-all duration-150 cursor-pointer ml-1"
              onChange={handleLineSpacingChange}
              value={currentLineSpacing}
              title="Line Spacing"
            >
              <option value="1">1.0</option>
              <option value="1.15">1.15</option>
              <option value="1.5">1.5</option>
              <option value="1.75">1.75</option>
              <option value="2">2.0</option>
              <option value="2.5">2.5</option>
              <option value="3">3.0</option>
            </select>
          </>
        )}
      </div>

      {/* Right Side - Mode Controls */}
      <div className="flex items-center">
          {hideModeSwitcher ? (
            <span className="text-xs text-gray-500 px-1">
              {mode === 'wysiwyg' ? 'WYSIWYG' : mode === 'markdown' ? 'MD' : 'HTML'}
            </span>
          ) : (
            <button
              className="animate-breathe-text text-xs text-gray-700 px-2 py-1 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
              onClick={toggleMode}
              title={`Switch to ${mode === 'wysiwyg' ? 'Markdown' : mode === 'markdown' ? 'HTML' : 'WYSIWYG'} mode`}
              type="button"
            >
              {mode === 'wysiwyg' ? 'WYSIWYG' : mode === 'markdown' ? 'MD' : 'HTML'}
            </button>
          )}
      </div>
    </div>
  );
};

