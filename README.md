# React RTE

A reusable Rich Text Editor built with React. This is a React port of the Qwik-based rich text editor.

## Features

- **WYSIWYG Mode**: Visual editing with formatting toolbar
- **Markdown Mode**: Edit in markdown syntax
- **HTML Mode**: Direct HTML editing
- **Preview Mode**: Preview rendered HTML with syntax highlighting
- **Word Highlighting**: Highlight specific words with custom colors
- **Formatting Tools**: Bold, italic, underline, headings, lists, alignment, line spacing
- **Paste Cleanup**: Automatically removes background colors, line-height, padding, and margin from pasted content

## Installation

```bash
npm install
```

## Usage

```jsx
import { RichTextEditor } from '@react-rte/lib';

function App() {
  const handleChange = (text, html, markdown) => {
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('Markdown:', markdown);
  };

  return (
    <RichTextEditor
      placeholder="Start typing..."
      initialContent="<p>Hello world</p>"
      onChange={handleChange}
      initialMode="wysiwyg"
      highlightWords={['hello', 'world']}
      highlightWordColors={[
        { word: 'hello', color: { class: 'bg-yellow-200', text: 'text-yellow-800' } }
      ]}
      onWordClick={(word) => console.log('Clicked word:', word)}
    />
  );
}
```

## Props

- `placeholder` (string): Placeholder text for the editor
- `initialContent` (string): Initial HTML content
- `onChange` (function): Callback when content changes `(text, html, markdown) => void`
- `initialMode` ('wysiwyg' | 'markdown' | 'html'): Initial editing mode
- `hideModeSwitcher` (boolean): Hide the mode switcher button
- `highlightWords` (string[]): Array of words to highlight
- `highlightWordColors` (Array<{word: string, color: {class: string, text: string}}>): Multi-color word highlighting
- `onWordClick` (function): Callback when a word is clicked in preview mode `(word: string) => void`

## Exports

- `RichTextEditor`: Main editor component
- `MarkdownPreview`: Preview component
- `htmlToMarkdown`: Convert HTML to markdown
- `markdownToHtml`: Convert markdown to HTML
- `highlightWords`: Highlight words in HTML string

