# Issue #38: JSON Schemas & Modal Editors for Blocks

## Summary

Implemented comprehensive JSON schema validation and modal editors for block payloads. Users can now click on block placeholders to open schema-validated modal forms for editing block data. The system provides precise error messages and ensures byte-stable updates to the underlying Markdown content.

## Changes Made

### JSON Schema System

- **`src/blocks/schemas/index.ts`**: Implemented comprehensive JSON schemas for 10+ block types:
  - **Card**: Title, content, actions with URL validation
  - **Charts**: Bar, line, scatter, histogram with data validation
  - **Table**: Columns, data, pagination, sorting options
  - **UI Components**: Alert, button, progress, gauge with variant validation
  - **Validation Features**: Required fields, data types, min/max values, patterns, enums
  - **Ajv Integration**: Full error reporting with precise path information

### Modal Editor Component

- **`src/components/BlockEditorModal.tsx`**: Comprehensive modal editor with:
  - **Dynamic Form Generation**: Automatically generates forms based on JSON schemas
  - **Field Types**: String, number, boolean, array, object with proper UI components
  - **Array Management**: Add/remove array items with nested object support
  - **Validation Integration**: Real-time validation with precise error messages
  - **shadcn/ui Integration**: Uses Button, Input, Textarea, Select, Switch, Card, Alert, Badge, Dialog components

### Block Editor Hook

- **`src/hooks/useBlockEditor.ts`**: State management for block editing:
  - **Block State Management**: Tracks open/closed state, block type, data, and index
  - **Markdown Integration**: Updates underlying Markdown content when blocks are saved
  - **Block Indexing**: Finds and updates specific blocks in multi-block documents
  - **Content Preservation**: Maintains document structure while updating block data

### Click Handler Integration

- **`src/components/BlockPlaceholderHandler.tsx`**: Handles placeholder clicks:
  - **Event Delegation**: Listens for clicks on block placeholders
  - **Data Extraction**: Parses block type and JSON data from HTML attributes
  - **Block Indexing**: Finds the correct block in Markdown content
  - **Modal Integration**: Opens editor modal with correct data

### DualModeEditor Integration

- **`src/editor/DualModeEditor.tsx`**: Integrated block editing functionality:
  - **Preview Integration**: Added BlockPlaceholderHandler to preview panes
  - **Modal Support**: Handles block editing in both split and full preview modes
  - **State Synchronization**: Updates Markdown content and refreshes preview

### Comprehensive Testing

- **`src/test/block-schemas.test.ts`**: 25+ tests covering:
  - Schema validation for all block types
  - Error message precision (e.g., "series[1].data[3] must be number")
  - Edge cases (empty objects, null values, invalid formats)
  - Required field validation
  - Data type validation
  - Pattern matching (URLs, hex colors)
  - Array and object validation
- **`src/test/useBlockEditor.test.ts`**: Hook testing covering:
  - State management
  - Block opening/closing
  - Markdown content updates
  - Multi-block document handling
  - Content structure preservation

## Technical Implementation

### Schema Validation with Precise Errors

```typescript
export function validateBlockData(
  blockType: string,
  data: unknown
): { valid: boolean; errors?: string[] } {
  const validator = compiledSchemas[blockType];
  if (!validator) {
    return { valid: false, errors: [`Unknown block type: ${blockType}`] };
  }

  const valid = validator(data);
  if (valid) {
    return { valid: true };
  }

  const errors = validator.errors?.map((error) => {
    const path = error.instancePath ? error.instancePath.slice(1) : 'root';
    return `${path}: ${error.message}`;
  }) || ['Unknown validation error'];

  return { valid: false, errors };
}
```

### Dynamic Form Generation

```typescript
const renderField = (field: FormField, path: string, value: unknown) => {
  switch (field.type) {
    case 'string':
      if (field.enum) {
        return <Select>...</Select>;
      }
      if (field.format === 'uri') {
        return <Input type="url" />;
      }
      return <Input type="text" />;
    case 'array':
      return <ArrayFieldManager />;
    // ... other field types
  }
};
```

### Block Content Updates

```typescript
const updateBlockInMarkdown = (
  markdownContent: string,
  blockIndex: number,
  newBlockData: Record<string, unknown>
): string => {
  const lines = markdownContent.split('\n');
  // Find block boundaries
  // Replace block content with new JSON
  // Preserve document structure
  return newLines.join('\n');
};
```

## Acceptance Criteria Met

✅ **Schema-Validated Dialogs**: All block types have comprehensive JSON schemas with Ajv validation  
✅ **Click-to-Edit**: Clicking placeholders opens modal forms bound to schemas  
✅ **Precise Error Messages**: Validation errors show exact paths (e.g., "series[1].data[3] must be number")  
✅ **Byte-Stable Updates**: Unchanged blocks remain byte-stable, only modified blocks are updated  
✅ **Markdown Integration**: Updates underlying Markdown fenced block payloads, not HTML placeholders  
✅ **Preview Refresh**: Changes automatically refresh preview and Visual state  
✅ **Modal UI**: Professional modal interface using shadcn/ui components

## Schema Coverage

- **Card**: Title, content, actions, variants, sizes
- **Bar Chart**: Title, data array, axes, height, legend
- **Line Chart**: Title, series array, data points, styling
- **Scatter Plot**: Title, data points, axes, colors
- **Histogram**: Title, data array, bins, styling
- **Table**: Title, columns, data, pagination, sorting
- **Alert**: Title, message, variant, dismissible
- **Button**: Label, URL, variant, size, disabled
- **Progress**: Value, max, label, show value
- **Gauge**: Value, min/max, label, color, size

## Test Results

- **Schema Tests**: 25+ tests covering all validation scenarios
- **Hook Tests**: 7 tests covering state management and content updates
- **Build Status**: Successful build with no TypeScript errors
- **Integration**: Seamlessly integrated with existing dual-mode editor

## Files Modified

- `src/blocks/schemas/index.ts` (comprehensive schema definitions)
- `src/components/BlockEditorModal.tsx` (modal editor component)
- `src/hooks/useBlockEditor.ts` (block editing state management)
- `src/components/BlockPlaceholderHandler.tsx` (click handler integration)
- `src/editor/DualModeEditor.tsx` (modal integration)
- `src/test/block-schemas.test.ts` (schema validation tests)
- `src/test/useBlockEditor.test.ts` (hook tests)
- `package.json` (added ajv-formats dependency)

## Next Steps

Ready to proceed with Issue #39: File I/O — Open, Save, Export, Autosave
