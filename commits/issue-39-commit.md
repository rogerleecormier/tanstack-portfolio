# Issue #39: File I/O — Open, Save, Export, Autosave

## Summary

Implemented comprehensive file I/O functionality using the File System Access API with fallback support. The system provides robust authoring capabilities including file opening, saving, exporting to HTML, and automatic draft saving to localStorage. All functionality works without paid libraries and includes keyboard shortcuts and user-friendly interfaces.

## Changes Made

### File I/O Hook

- **`src/hooks/useFileIO.ts`**: Comprehensive file I/O management with:
  - **File System Access API**: Native file picker integration with fallback to input elements
  - **Save Functionality**: Save and Save As with both FS Access API and Blob download fallbacks
  - **HTML Export**: Standalone HTML export with inline CSS for complete portability
  - **Autosave System**: Automatic draft saving to localStorage every 5 seconds when content is dirty
  - **Draft Restoration**: Automatic restoration of drafts on page load with 24-hour expiration
  - **Unsaved Changes Warning**: Browser warning before leaving with unsaved changes
  - **State Management**: Tracks file name, dirty state, last saved time, and unsaved changes

### File Menu Component

- **`src/components/FileMenu.tsx`**: Professional file menu interface with:
  - **Dropdown Menu**: Clean dropdown interface using shadcn/ui components
  - **Status Indicators**: Visual indicators for saved/unsaved state with timestamps
  - **File Operations**: Open, Save, Save As, Export HTML, New Document
  - **Keyboard Shortcuts**: Display of keyboard shortcuts (Ctrl+S, Ctrl+O, Ctrl+N)
  - **Smart States**: Disabled states for unavailable actions (e.g., Save when not dirty)

### Dropdown Menu Component

- **`src/components/ui/dropdown-menu.tsx`**: Complete shadcn/ui dropdown menu implementation:
  - **Radix UI Integration**: Full dropdown menu functionality with submenus
  - **Accessibility**: Proper ARIA attributes and keyboard navigation
  - **Styling**: Consistent with shadcn/ui design system
  - **Features**: Separators, shortcuts, checkboxes, radio items, labels

### DualModeEditor Integration

- **`src/editor/DualModeEditor.tsx`**: Integrated file I/O functionality:
  - **File Menu Integration**: Added FileMenu component to header
  - **Keyboard Shortcuts**: Global keyboard shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+O, Ctrl+N)
  - **HTML Export**: Export current preview HTML with proper styling
  - **State Synchronization**: File I/O state synchronized with editor content

### Comprehensive Testing

- **`src/test/useFileIO.test.ts`**: 15+ tests covering:
  - File System Access API integration
  - Fallback input element functionality
  - Autosave and draft restoration
  - Save/Save As operations
  - HTML export functionality
  - Keyboard shortcuts
  - Unsaved changes warnings
  - Error handling and edge cases
- **`src/test/FileMenu.test.tsx`**: Component testing covering:
  - File menu rendering and interactions
  - Status indicator display
  - Dropdown menu functionality
  - Keyboard shortcut display
  - State-based UI updates

## Technical Implementation

### File System Access API with Fallback

```typescript
const openFile = useCallback(async () => {
  try {
    if (isFileSystemAccessSupported()) {
      // Use File System Access API
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Markdown files',
            accept: { 'text/markdown': ['.md', '.markdown'] },
          },
        ],
        excludeAcceptAllOption: true,
      });
      // ... handle file
    } else {
      // Fallback to input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown';
      // ... handle file
    }
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}, []);
```

### Autosave System

```typescript
const autosave = useCallback(() => {
  if (state.isDirty && content.trim()) {
    try {
      localStorage.setItem('markdown-editor-draft', content);
      localStorage.setItem(
        'markdown-editor-draft-timestamp',
        Date.now().toString()
      );
    } catch (error) {
      console.error('Failed to autosave:', error);
    }
  }
}, [content, state.isDirty]);

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
```

### Standalone HTML Export

```typescript
const exportHTML = useCallback(
  (htmlContent: string) => {
    const standaloneHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.fileName ? state.fileName.replace('.md', '') : 'Document'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        /* ... complete CSS for standalone rendering ... */
    </style>
</head>
<body>${htmlContent}</body>
</html>`;

    const blob = new Blob([standaloneHTML], { type: 'text/html' });
    // ... download logic
  },
  [state.fileName]
);
```

### Keyboard Shortcuts

```typescript
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
```

## Acceptance Criteria Met

✅ **Open .md Files**: File System Access API with input fallback for opening Markdown files  
✅ **Save .md Files**: FS Access API or Blob download for saving Markdown files  
✅ **Export .html**: Uses current sanitized preview HTML with minimal inline CSS  
✅ **Autosave**: Saves to localStorage every 5s when dirty, restores on load  
✅ **Content Preservation**: Open/edit/save/reopen preserves content exactly  
✅ **Crash Recovery**: Crash/reload restores draft from localStorage  
✅ **Standalone HTML**: Exported HTML renders standalone with embedded CSS

## Features Implemented

- **File System Access API**: Native file picker integration
- **Fallback Support**: Input element fallback for unsupported browsers
- **Save Operations**: Save and Save As with multiple fallback methods
- **HTML Export**: Complete standalone HTML with embedded CSS
- **Autosave**: Automatic draft saving every 5 seconds
- **Draft Restoration**: Automatic restoration with 24-hour expiration
- **Keyboard Shortcuts**: Ctrl+S, Ctrl+Shift+S, Ctrl+O, Ctrl+N
- **Status Indicators**: Visual feedback for saved/unsaved state
- **Unsaved Changes Warning**: Browser warning before leaving
- **Professional UI**: Clean dropdown menu with proper states

## Test Coverage

- **File I/O Hook**: 15+ tests covering all functionality
- **File Menu Component**: 12+ tests covering UI interactions
- **Type Safety**: Full TypeScript coverage with proper error handling
- **Edge Cases**: Error handling, fallback scenarios, and edge cases

## Files Modified

- `src/hooks/useFileIO.ts` (comprehensive file I/O hook)
- `src/components/FileMenu.tsx` (file menu component)
- `src/components/ui/dropdown-menu.tsx` (dropdown menu component)
- `src/editor/DualModeEditor.tsx` (file I/O integration)
- `src/test/useFileIO.test.ts` (file I/O tests)
- `src/test/FileMenu.test.tsx` (file menu tests)
- `package.json` (added @radix-ui/react-dropdown-menu dependency)

## Next Steps

Ready to proceed with Issue #40: Paste Policy & Sanitization
