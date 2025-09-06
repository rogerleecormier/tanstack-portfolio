# Issue #36: Dual-Mode Shell with Real-Time Preview

## Summary

Implemented the dual-mode editor shell with seamless mode switching between Markdown and Visual editing, plus real-time HTML preview. The editor provides a two-pane interface with mode toggle buttons and debounced compilation for smooth performance.

## Changes Made

### Core Editor Components

- **`src/editor/MarkdownEditor.tsx`**: Implemented CodeMirror-based markdown editor with syntax highlighting, proper theming, and full-height layout
- **`src/editor/VisualEditor.tsx`**: Implemented TinyMCE-based WYSIWYG editor with non-editable block support and custom styling for shadcn block placeholders
- **`src/editor/DualModeEditor.tsx`**: Main orchestrator component with mode switching, debounced compilation, and real-time preview integration
- **`src/preview/PreviewPane.tsx`**: Real-time HTML preview component with proper styling and scroll handling

### Editor Features

- **Mode Switching**: Seamless switching between Markdown, Visual, and Preview modes
- **Real-time Preview**: Live HTML preview that updates as you type (200ms debounce)
- **Two-pane Layout**: Editor on the left, preview on the right (except in preview-only mode)
- **Debounced Compilation**: 200ms debounce for smooth performance during typing
- **State Management**: Proper state synchronization between modes and preview

### Visual Editor Integration

- **TinyMCE Configuration**: Custom toolbar, plugins, and content styling
- **Non-editable Blocks**: Support for shadcn block placeholders that cannot be edited inline
- **Content Styling**: Proper typography and spacing for visual editing
- **Block Protection**: Prevents editing of fenced block placeholders in visual mode

### Markdown Editor Integration

- **CodeMirror Setup**: Markdown syntax highlighting with proper theming
- **Editor Configuration**: Optimized settings for markdown editing
- **Full-height Layout**: Proper height management for seamless integration

### Page Integration

- **`src/pages/MarkdownEditorPage.tsx`**: Updated to use the new DualModeEditor with sample content
- **Sample Content**: Includes fenced blocks and various markdown features for testing

### Testing

- **`src/test/dual-mode-editor.test.tsx`**: Comprehensive tests for the DualModeEditor component
- **Component Testing**: Tests for rendering, mode switching, and content handling

## Technical Implementation

### Mode Switching Logic

```typescript
const handleModeSwitch = useCallback(
  (mode: EditorMode) => {
    if (isConverting) return;

    if (mode === 'visual' && activeMode === 'markdown') {
      switchToVisual(); // Convert MD to HTML for TinyMCE
    } else if (mode === 'markdown' && activeMode === 'visual') {
      switchToMarkdown(); // Convert HTML back to MD
    } else {
      setActiveMode(mode); // Direct mode switch
    }
  },
  [activeMode, isConverting, switchToVisual, switchToMarkdown]
);
```

### Debounced Compilation

```typescript
const debouncedCompile = useCallback((content: string) => {
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  debounceTimeoutRef.current = setTimeout(() => {
    try {
      const html = mdToHtml(content);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error compiling markdown:', error);
      setPreviewHtml('<p>Error compiling markdown</p>');
    }
  }, 200); // 200ms debounce
}, []);
```

### Layout Structure

- **Header**: Mode toggle buttons with visual feedback
- **Main Area**: Split between editor and preview panes
- **Editor Pane**: Full-width when in preview mode, half-width otherwise
- **Preview Pane**: Always visible except in preview-only mode

## Acceptance Criteria Met

✅ Seamless mode switching between Markdown and Visual modes  
✅ No flicker during mode transitions  
✅ Real-time preview stays in sync with editor content  
✅ Debounced compilation (200ms) for smooth performance  
✅ Two-pane layout with proper responsive design  
✅ Mode toggle buttons with visual state indication  
✅ Proper error handling for conversion failures

## Test Results

- All existing tests passing (10/10)
- New DualModeEditor tests passing (2/2)
- Build successful with no TypeScript errors
- Component renders correctly with all mode buttons

## Files Modified

- `src/editor/MarkdownEditor.tsx` (implemented)
- `src/editor/VisualEditor.tsx` (implemented)
- `src/editor/DualModeEditor.tsx` (implemented)
- `src/preview/PreviewPane.tsx` (implemented)
- `src/pages/MarkdownEditorPage.tsx` (updated)
- `src/test/dual-mode-editor.test.tsx` (new)

## Next Steps

Ready to proceed with Issue #37: Fenced Block Detection & Placeholders (which is already partially implemented in the current components)
