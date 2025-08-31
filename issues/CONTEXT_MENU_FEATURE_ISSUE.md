# Add Right-Click Context Menu to HTML/Markdown Editor in Content Creation Studio

## 🎯 Feature Request

Add a right-click context menu to the HTML/Markdown editor in the Content Creation Studio with shadcn/ui styling and TipTap integration.

## 📋 Requirements

### Core Functionality
- Right-click context menu on text selection in the TipTap editor
- shadcn/ui styling and components for consistent design
- Context-aware menu items based on current selection and cursor position
- Proper positioning that handles viewport edges

### Editor Actions
- **Text Operations**: Copy, Cut, Paste, Select All, Delete
- **Formatting**: Bold, Italic, Underline, Strikethrough
- **Markdown**: Code, Code Block, Link, Image
- **Structure**: Headings (H1, H2, H3), Lists (Bullet, Numbered), Blockquote
- **Advanced**: Table operations, Chart insertion, Horizontal rule

### Technical Requirements
- Integrate with existing TipTap editor configuration in Content Creation Studio
- Follow shadcn/ui best practices for context menu implementation
- Use shadcn/ui `DropdownMenu` component with proper styling and theming
- Handle mobile devices with long-press alternative
- Ensure accessibility (keyboard navigation, screen readers)
- Follow existing project patterns and logging standards

## 🔧 Technical Implementation

### Current State Analysis
- Content Creation Studio uses TipTap with StarterKit, Highlight, CodeBlockLowlight, Table, and Chart extensions
- shadcn/ui components already available: `DropdownMenu`, `Button`, `Separator`, etc.
- No existing context menu implementation in Content Creation Studio

### Proposed Implementation
```typescript
// New context menu component
interface EditorContextMenuProps {
  editor: Editor
  position: { x: number; y: number }
  onClose: () => void
}

// Integration with TipTap
const handleContextMenu = (event: React.MouseEvent) => {
  event.preventDefault()
  const selection = editor.state.selection
  const hasSelection = !selection.empty
  
  setContextMenuPosition({ x: event.clientX, y: event.clientY })
  setShowContextMenu(true)
  setSelectionState({ hasSelection, selection })
}
```

### File Structure
```
src/components/ContentCreationStudio/
├── EditorContextMenu.tsx          # New context menu component
├── ContextMenuItems.tsx           # Menu item definitions
└── useEditorContextMenu.ts        # Hook for context menu logic
```

## ✅ Acceptance Criteria

- [ ] Right-click shows context menu following shadcn/ui design system
- [ ] Menu appears at cursor position with proper viewport handling
- [ ] Basic text operations (copy, cut, paste, select all) work correctly
- [ ] Markdown formatting options (bold, italic, code, etc.) apply to selection
- [ ] Context-aware menu items (e.g., link options only for text selection)
- [ ] Mobile support with long-press alternative
- [ ] Keyboard navigation support (arrow keys, enter, escape) following shadcn/ui patterns
- [ ] Accessibility compliance (ARIA labels, screen reader support)
- [ ] Integration with existing TipTap commands and extensions in Content Creation Studio
- [ ] Consistent with shadcn/ui design system and project theming

## 🎨 UI/UX Design

### Visual Design
- Follow shadcn/ui design system and best practices
- Use shadcn/ui `DropdownMenu` component with proper theming
- Implement consistent spacing, typography, and color tokens
- Include appropriate Lucide icons for each menu item
- Smooth animations and transitions using shadcn/ui patterns

### Menu Layout
```
┌─────────────────────────┐
│ 📋 Copy                 │
│ ✂️  Cut                  │
│ 📋 Paste                │
│ ─────────────────────── │
│ **Bold**                │
│ *Italic*                │
│ `Code`                  │
│ ─────────────────────── │
│ # Heading 1             │
│ ## Heading 2            │
│ - List                  │
│ ─────────────────────── │
│ 🔗 Link                 │
│ 📊 Chart                │
│ ─────────────────────── │
│ ❌ Delete               │
└─────────────────────────┘
```

## 🚀 Implementation Phases

### Phase 1: Basic Context Menu
- [ ] Create `EditorContextMenu` component
- [ ] Implement basic text operations
- [ ] Add core formatting options
- [ ] Basic positioning and styling

### Phase 2: Enhanced Functionality
- [ ] Add markdown-specific options
- [ ] Implement context-aware menu items
- [ ] Add table and chart operations
- [ ] Mobile long-press support

### Phase 3: Polish & Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Performance optimization
- [ ] Comprehensive testing

## 🔍 Research & References

### Design Patterns
- shadcn/ui `DropdownMenu` component best practices
- TipTap editor integration patterns
- Modern context menu UX patterns

### Related Components
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/tooltip.tsx`

## 📝 Notes

- Follow shadcn/ui component composition patterns for maintainability
- Use TipTap's built-in commands for consistency with editor behavior
- Ensure context menu doesn't interfere with existing keyboard shortcuts
- Test with various content types (text, tables, charts, code blocks)
- Consider adding user preferences for context menu behavior
- Implement proper focus management and keyboard navigation following shadcn/ui patterns

## 🏷️ Labels

`enhancement`, `editor`, `ui/ux`, `shadcn`, `tiptap`, `accessibility`

## 📊 Priority

**Medium** - Improves editor usability and aligns with modern editor expectations

## 👥 Assignee

*To be assigned when implementation begins*

---

*This issue was created to track the implementation of a right-click context menu feature for the Content Creation Studio's HTML/Markdown editor.*
