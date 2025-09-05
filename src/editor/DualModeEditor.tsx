import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Code } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import VisualEditor from './VisualEditor';
import PreviewPane from '../preview/PreviewPane';
import BlockPlaceholderHandler from '../components/BlockPlaceholderHandler';
import FileMenu from '../components/FileMenu';
import { useFileIO } from '../hooks/useFileIO';
import { mdToHtml } from '../compile/mdToHtml';
import { htmlToMd } from '../compile/htmlToMd';

interface DualModeEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

type EditorMode = 'markdown' | 'visual' | 'preview';

/**
 * Dual Mode Editor Component
 * Combines Markdown and Visual editors with mode switching
 */
const DualModeEditor: React.FC<DualModeEditorProps> = ({
  initialValue = '',
  onChange,
  className = '',
}) => {
  const [markdownContent, setMarkdownContent] = useState(initialValue);
  const [visualContent, setVisualContent] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeMode, setActiveMode] = useState<EditorMode>('markdown');
  const [isConverting, setIsConverting] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMarkdownRef = useRef(initialValue);

  // File I/O functionality
  const fileIO = useFileIO(markdownContent, setMarkdownContent);

  // Debounced compilation function
  const debouncedCompile = useCallback((content: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const html = mdToHtml(content);
        setPreviewHtml(html);
        lastMarkdownRef.current = content;
      } catch (error) {
        console.error('Error compiling markdown:', error);
        setPreviewHtml('<p>Error compiling markdown</p>');
      }
    }, 200); // 200ms debounce
  }, []);

  // Handle markdown changes
  const handleMarkdownChange = useCallback(
    (content: string) => {
      setMarkdownContent(content);
      debouncedCompile(content);
      onChange?.(content);
    },
    [debouncedCompile, onChange]
  );

  // Handle visual editor changes
  const handleVisualChange = useCallback(
    (content: string) => {
      setVisualContent(content);
      // Convert visual HTML back to markdown for preview
      try {
        const markdown = htmlToMd(content);
        setMarkdownContent(markdown);
        debouncedCompile(markdown);
        onChange?.(markdown);
      } catch (error) {
        console.error('Error converting HTML to markdown:', error);
      }
    },
    [debouncedCompile, onChange]
  );

  // Switch to visual mode
  const switchToVisual = useCallback(async () => {
    if (isConverting) return;

    setIsConverting(true);
    try {
      // Convert current markdown to HTML for visual editor
      const html = mdToHtml(markdownContent);
      setVisualContent(html);
      setActiveMode('visual');
    } catch (error) {
      console.error('Error converting to visual mode:', error);
    } finally {
      setIsConverting(false);
    }
  }, [markdownContent, isConverting]);

  // Switch to markdown mode
  const switchToMarkdown = useCallback(async () => {
    if (isConverting) return;

    setIsConverting(true);
    try {
      // Convert visual HTML back to markdown
      const markdown = htmlToMd(visualContent);
      setMarkdownContent(markdown);
      setActiveMode('markdown');
    } catch (error) {
      console.error('Error converting to markdown mode:', error);
    } finally {
      setIsConverting(false);
    }
  }, [visualContent, isConverting]);

  // Handle mode switching
  const handleModeSwitch = useCallback(
    (mode: EditorMode) => {
      if (isConverting) return;

      if (mode === 'visual' && activeMode === 'markdown') {
        switchToVisual();
      } else if (mode === 'markdown' && activeMode === 'visual') {
        switchToMarkdown();
      } else {
        setActiveMode(mode);
      }
    },
    [activeMode, isConverting, switchToVisual, switchToMarkdown]
  );

  // Initialize preview on mount
  useEffect(() => {
    debouncedCompile(markdownContent);
  }, [debouncedCompile, markdownContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            if (event.shiftKey) {
              fileIO.saveAsFile();
            } else {
              fileIO.saveFile();
            }
            break;
          case 'o':
            event.preventDefault();
            fileIO.openFile();
            break;
          case 'n':
            event.preventDefault();
            fileIO.resetFile();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileIO]);

  // Export HTML handler
  const handleExportHTML = useCallback(() => {
    fileIO.exportHTML(previewHtml);
  }, [fileIO, previewHtml]);

  return (
    <div className={`dual-mode-editor h-full flex flex-col ${className}`}>
      {/* Header with file menu and mode toggle */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-4">
          <FileMenu
            fileName={fileIO.fileName}
            isDirty={fileIO.isDirty}
            hasUnsavedChanges={fileIO.hasUnsavedChanges}
            lastSaved={fileIO.lastSaved}
            onOpenFile={fileIO.openFile}
            onSaveFile={fileIO.saveFile}
            onSaveAsFile={fileIO.saveAsFile}
            onExportHTML={handleExportHTML}
            onResetFile={fileIO.resetFile}
          />

          {isConverting && (
            <div className="text-sm text-muted-foreground">Converting...</div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={activeMode === 'markdown' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeSwitch('markdown')}
            disabled={isConverting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Markdown
          </Button>

          <Button
            variant={activeMode === 'visual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeSwitch('visual')}
            disabled={isConverting}
          >
            <Code className="w-4 h-4 mr-2" />
            Visual
          </Button>

          <Button
            variant={activeMode === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeSwitch('preview')}
            disabled={isConverting}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Editor pane */}
        <div className="flex-1 border-r">
          {activeMode === 'markdown' && (
            <MarkdownEditor
              value={markdownContent}
              onChange={handleMarkdownChange}
              placeholder="Start writing your markdown..."
            />
          )}

          {activeMode === 'visual' && (
            <VisualEditor
              value={visualContent}
              onChange={handleVisualChange}
              placeholder="Start writing..."
            />
          )}

          {activeMode === 'preview' && (
            <div className="relative h-full">
              <PreviewPane html={previewHtml} />
              <BlockPlaceholderHandler
                markdownContent={markdownContent}
                onMarkdownChange={handleMarkdownChange}
              />
            </div>
          )}
        </div>

        {/* Preview pane (always visible except in preview mode) */}
        {activeMode !== 'preview' && (
          <div className="w-1/2">
            <div className="h-full border-l bg-muted/20">
              <div className="p-3 border-b bg-background">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Preview
                </h3>
              </div>
              <div className="relative h-full">
                <PreviewPane html={previewHtml} />
                <BlockPlaceholderHandler
                  markdownContent={markdownContent}
                  onMarkdownChange={handleMarkdownChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualModeEditor;
