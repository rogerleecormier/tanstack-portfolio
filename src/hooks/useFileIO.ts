import { useState, useCallback, useEffect, useRef } from 'react';

interface FileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileIOState {
  fileName: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

interface FileIOActions {
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  saveAsFile: () => Promise<void>;
  exportHTML: (htmlContent: string) => void;
  resetFile: () => void;
}

export function useFileIO(
  content: string,
  onContentChange: (newContent: string) => void
): FileIOState & FileIOActions {
  const [state, setState] = useState<FileIOState>({
    fileName: null,
    isDirty: false,
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  const fileHandleRef = useRef<FileHandle | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(content);

  // Check if File System Access API is supported
  const isFileSystemAccessSupported = useCallback(() => {
    return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }, []);

  // Autosave to localStorage
  const autosave = useCallback(() => {
    if (state.isDirty && content.trim()) {
      try {
        localStorage.setItem('markdown-editor-draft', content);
        localStorage.setItem(
          'markdown-editor-draft-timestamp',
          Date.now().toString()
        );
        console.log('Autosaved to localStorage');
      } catch (error) {
        console.error('Failed to autosave:', error);
      }
    }
  }, [content, state.isDirty]);

  // Restore draft from localStorage
  const restoreDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('markdown-editor-draft');
      const timestamp = localStorage.getItem('markdown-editor-draft-timestamp');

      if (draft && timestamp) {
        const draftAge = Date.now() - parseInt(timestamp, 10);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (draftAge < maxAge) {
          onContentChange(draft);
          setState((prev) => ({
            ...prev,
            isDirty: true,
            hasUnsavedChanges: true,
          }));
          console.log('Restored draft from localStorage');
        } else {
          // Clear old draft
          localStorage.removeItem('markdown-editor-draft');
          localStorage.removeItem('markdown-editor-draft-timestamp');
        }
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
    }
  }, [onContentChange]);

  // Open file using File System Access API or fallback
  const openFile = useCallback(async () => {
    try {
      if (isFileSystemAccessSupported()) {
        // Use File System Access API
        const [fileHandle] = await (
          window as unknown as {
            showOpenFilePicker: (options: unknown) => Promise<FileHandle[]>;
          }
        ).showOpenFilePicker({
          types: [
            {
              description: 'Markdown files',
              accept: {
                'text/markdown': ['.md', '.markdown'],
              },
            },
          ],
          excludeAcceptAllOption: true,
        });

        const file = await fileHandle.getFile();
        const content = await file.text();

        fileHandleRef.current = fileHandle;
        onContentChange(content);

        setState((prev) => ({
          ...prev,
          fileName: file.name,
          isDirty: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        }));

        // Clear draft since we opened a new file
        localStorage.removeItem('markdown-editor-draft');
        localStorage.removeItem('markdown-editor-draft-timestamp');
      } else {
        // Fallback to input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown';

        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const content = await file.text();
            onContentChange(content);

            setState((prev) => ({
              ...prev,
              fileName: file.name,
              isDirty: false,
              hasUnsavedChanges: false,
              lastSaved: new Date(),
            }));

            // Clear draft since we opened a new file
            localStorage.removeItem('markdown-editor-draft');
            localStorage.removeItem('markdown-editor-draft-timestamp');
          }
        };

        input.click();
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [isFileSystemAccessSupported, onContentChange]);

  // Save as file
  const saveAsFile = useCallback(async () => {
    try {
      if (isFileSystemAccessSupported()) {
        // Use File System Access API
        const fileHandle = await (
          window as unknown as {
            showSaveFilePicker: (options: unknown) => Promise<FileHandle>;
          }
        ).showSaveFilePicker({
          types: [
            {
              description: 'Markdown files',
              accept: {
                'text/markdown': ['.md'],
              },
            },
          ],
          suggestedName: state.fileName || 'document.md',
        });

        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        fileHandleRef.current = fileHandle;

        setState((prev) => ({
          ...prev,
          fileName: 'document.md', // FileHandle doesn't have a name property
          isDirty: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        }));

        // Clear draft since we saved
        localStorage.removeItem('markdown-editor-draft');
        localStorage.removeItem('markdown-editor-draft-timestamp');
      } else {
        // Fallback to download
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.fileName || 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setState((prev) => ({
          ...prev,
          isDirty: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        }));

        // Clear draft since we saved
        localStorage.removeItem('markdown-editor-draft');
        localStorage.removeItem('markdown-editor-draft-timestamp');
      }
    } catch (error) {
      console.error('Failed to save as file:', error);
    }
  }, [content, state.fileName, isFileSystemAccessSupported]);

  // Save file using File System Access API or download
  const saveFile = useCallback(async () => {
    try {
      if (fileHandleRef.current && isFileSystemAccessSupported()) {
        // Use existing file handle
        const writable = await fileHandleRef.current.createWritable();
        await writable.write(content);
        await writable.close();

        setState((prev) => ({
          ...prev,
          isDirty: false,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        }));

        // Clear draft since we saved
        localStorage.removeItem('markdown-editor-draft');
        localStorage.removeItem('markdown-editor-draft-timestamp');
      } else {
        // Fallback to save as
        await saveAsFile();
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }, [content, isFileSystemAccessSupported, saveAsFile]);

  // Export HTML
  const exportHTML = useCallback(
    (htmlContent: string) => {
      try {
        // Create standalone HTML with inline CSS
        const standaloneHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.fileName ? state.fileName.replace('.md', '') : 'Document'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2em;
            margin-bottom: 1em;
            font-weight: 600;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        p { margin-bottom: 1em; }
        ul, ol { margin-bottom: 1em; padding-left: 2em; }
        li { margin-bottom: 0.25em; }
        blockquote {
            border-left: 4px solid #dfe2e5;
            padding-left: 1em;
            margin: 1em 0;
            color: #6a737d;
        }
        code {
            background-color: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        }
        pre {
            background-color: #f6f8fa;
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        th, td {
            border: 1px solid #dfe2e5;
            padding: 0.5em;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .shadcn-block-placeholder {
            background-color: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            text-align: center;
            color: #6b7280;
            font-weight: 500;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

        const blob = new Blob([standaloneHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.fileName ? state.fileName.replace('.md', '') : 'document'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export HTML:', error);
      }
    },
    [state.fileName]
  );

  // Reset file state
  const resetFile = useCallback(() => {
    fileHandleRef.current = null;
    setState({
      fileName: null,
      isDirty: false,
      lastSaved: null,
      hasUnsavedChanges: false,
    });
  }, []);

  // Track content changes for dirty state
  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      setState((prev) => ({
        ...prev,
        isDirty: true,
        hasUnsavedChanges: true,
      }));
    }
  }, [content]);

  // Autosave timer
  useEffect(() => {
    if (state.isDirty) {
      autosaveTimeoutRef.current = setTimeout(autosave, 5000); // 5 seconds
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [state.isDirty, autosave]);

  // Restore draft on mount
  useEffect(() => {
    restoreDraft();
  }, [restoreDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  return {
    ...state,
    openFile,
    saveFile,
    saveAsFile,
    exportHTML,
    resetFile,
  };
}
