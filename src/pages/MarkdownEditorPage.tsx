import React, { useState } from 'react';
import DualModeEditor from '../editor/DualModeEditor';

const MarkdownEditorPage: React.FC = () => {
  const [content, setContent] = useState(`# Welcome to the Dual-Mode Editor

This is a **markdown** editor with real-time preview and visual editing capabilities.

## Features

- **Markdown Mode**: Write in markdown with syntax highlighting
- **Visual Mode**: WYSIWYG editing with TinyMCE
- **Real-time Preview**: See your content as it will appear
- **Fenced Blocks**: Support for custom components

## Try a Fenced Block

\`\`\`card
{
  "title": "Sample Card",
  "content": "This is a sample card component",
  "actions": [
    {
      "label": "Learn More",
      "url": "#"
    }
  ]
}
\`\`\`

## More Content

You can switch between modes seamlessly, and the content will be preserved exactly as you wrote it.

- List item 1
- List item 2
- List item 3

> This is a blockquote to test the formatting.

The editor supports all standard markdown features plus custom fenced blocks for rich content.`);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="h-screen">
      <DualModeEditor
        initialValue={content}
        onChange={handleContentChange}
        className="h-full"
      />
    </div>
  );
};

export default MarkdownEditorPage;
