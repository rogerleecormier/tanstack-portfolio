import { useState, useCallback } from 'react';
import { validateBlockData } from '../blocks/schemas';

interface BlockEditorState {
  isOpen: boolean;
  blockType: string;
  blockData: Record<string, unknown>;
  blockIndex: number;
  markdownContent: string;
}

export function useBlockEditor() {
  const [editorState, setEditorState] = useState<BlockEditorState>({
    isOpen: false,
    blockType: '',
    blockData: {},
    blockIndex: -1,
    markdownContent: '',
  });

  const openBlockEditor = useCallback(
    (
      blockType: string,
      blockData: Record<string, unknown>,
      blockIndex: number,
      markdownContent: string
    ) => {
      setEditorState({
        isOpen: true,
        blockType,
        blockData,
        blockIndex,
        markdownContent,
      });
    },
    []
  );

  const closeBlockEditor = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const updateBlockInMarkdown = useCallback(
    (
      markdownContent: string,
      blockIndex: number,
      newBlockData: Record<string, unknown>
    ): string => {
      const lines = markdownContent.split('\n');
      let currentBlockIndex = -1;
      let blockStartLine = -1;
      let blockEndLine = -1;

      // Find the block at the specified index
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^```(\w+)$/)) {
          currentBlockIndex++;
          if (currentBlockIndex === blockIndex) {
            blockStartLine = i;
          }
        } else if (line === '```' && currentBlockIndex === blockIndex) {
          blockEndLine = i;
          break;
        }
      }

      if (blockStartLine === -1 || blockEndLine === -1) {
        return markdownContent; // Block not found
      }

      // Replace the block content
      const newBlockContent = JSON.stringify(newBlockData, null, 2);
      const newLines = [
        ...lines.slice(0, blockStartLine + 1),
        newBlockContent,
        ...lines.slice(blockEndLine),
      ];

      return newLines.join('\n');
    },
    []
  );

  const saveBlock = useCallback(
    (
      blockType: string,
      newBlockData: Record<string, unknown>,
      onMarkdownChange: (newMarkdown: string) => void
    ) => {
      // Validate the data
      const validation = validateBlockData(blockType, newBlockData);
      if (!validation.valid) {
        console.error('Block validation failed:', validation.errors);
        return;
      }

      // Update the markdown content
      const newMarkdown = updateBlockInMarkdown(
        editorState.markdownContent,
        editorState.blockIndex,
        newBlockData
      );

      if (newMarkdown !== editorState.markdownContent) {
        onMarkdownChange(newMarkdown);
      }
      closeBlockEditor();
    },
    [
      editorState.markdownContent,
      editorState.blockIndex,
      updateBlockInMarkdown,
      closeBlockEditor,
    ]
  );

  return {
    editorState,
    openBlockEditor,
    closeBlockEditor,
    saveBlock,
  };
}
