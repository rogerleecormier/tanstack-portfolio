import React, { useEffect, useRef, useCallback } from 'react';
import { useBlockEditor } from '../hooks/useBlockEditor';
import BlockEditorModal from './BlockEditorModal';

interface BlockPlaceholderHandlerProps {
  markdownContent: string;
  onMarkdownChange: (newMarkdown: string) => void;
}

const BlockPlaceholderHandler: React.FC<BlockPlaceholderHandlerProps> = ({
  markdownContent,
  onMarkdownChange,
}) => {
  const { editorState, openBlockEditor, closeBlockEditor, saveBlock } =
    useBlockEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  const findBlockIndex = useCallback(
    (
      content: string,
      blockType: string,
      blockData: Record<string, unknown>
    ): number => {
      const lines = content.split('\n');
      let currentBlockIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^```(\w+)$/);

        if (match && match[1] === blockType) {
          currentBlockIndex++;

          // Check if this is the block we're looking for
          const blockContent = extractBlockContent(lines, i);
          if (blockContent) {
            try {
              const parsedData = JSON.parse(blockContent);
              if (JSON.stringify(parsedData) === JSON.stringify(blockData)) {
                return currentBlockIndex;
              }
            } catch {
              // Continue searching
            }
          }
        }
      }

      return currentBlockIndex;
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const placeholder = target.closest(
        '.shadcn-block-placeholder'
      ) as HTMLElement;

      if (placeholder) {
        event.preventDefault();
        event.stopPropagation();
        openBlockEditorFromPlaceholder(placeholder);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const placeholder = target.closest(
        '.shadcn-block-placeholder'
      ) as HTMLElement;

      if (placeholder && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        openBlockEditorFromPlaceholder(placeholder);
      }
    };

    const openBlockEditorFromPlaceholder = (placeholder: HTMLElement) => {
      const blockType = placeholder.getAttribute('data-block-type');
      const blockJson = placeholder.getAttribute('data-json');

      if (blockType && blockJson) {
        try {
          // Decode HTML entities and newlines
          const decodedJson = blockJson
            .replace(/&quot;/g, '"')
            .replace(/\\n/g, '\n');

          const blockData = JSON.parse(decodedJson);

          // Find the block index in the markdown content
          const blockIndex = findBlockIndex(
            markdownContent,
            blockType,
            blockData
          );

          openBlockEditor(blockType, blockData, blockIndex, markdownContent);
        } catch {
          console.error('Error parsing block JSON');
        }
      }
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [markdownContent, openBlockEditor, findBlockIndex]);

  const extractBlockContent = (
    lines: string[],
    startLine: number
  ): string | null => {
    const contentLines: string[] = [];

    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === '```') {
        break;
      }
      contentLines.push(line);
    }

    return contentLines.length > 0 ? contentLines.join('\n') : null;
  };

  return (
    <>
      <div ref={containerRef} className="block-placeholder-handler">
        {/* This component doesn't render anything visible, it just handles clicks */}
      </div>

      <BlockEditorModal
        isOpen={editorState.isOpen}
        onClose={closeBlockEditor}
        onSave={(blockType, data) =>
          saveBlock(blockType, data, onMarkdownChange)
        }
        blockType={editorState.blockType}
        initialData={editorState.blockData}
      />
    </>
  );
};

export default BlockPlaceholderHandler;
