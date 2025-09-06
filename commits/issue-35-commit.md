# Issue #35: Converter — HTML → Markdown (Mode Switch Back)

## Summary

Implemented the HTML to Markdown converter with round-trip preservation of fenced JSON blocks. The converter ensures that fenced blocks remain byte-identical when switching between Visual and Markdown modes.

## Changes Made

### Core Converter Implementation

- **`src/compile/htmlToMd.ts`**: Implemented the HTML to Markdown conversion pipeline using `rehype-parse` → `rehype-to-remark` → `rehype-remark` → `remark-stringify`
- **`src/blocks/rehype-to-remark.ts`**: Created plugin to convert placeholder divs back to fenced code blocks with proper JSON content preservation

### Plugin Enhancements

- **`src/blocks/rehype-placeholders.ts`**: Enhanced to properly handle both string and array className formats, and added fallback detection for JSON content
- **`src/blocks/remark-shadcn-blocks.ts`**: Added `hProperties` to ensure language classes are preserved through the conversion pipeline

### Sanitization Updates

- **`src/compile/mdToHtml.ts`**: Updated sanitization schema to allow `data-json` attribute instead of `data-block-json` for better HTML attribute handling

### Testing

- **`src/test/converter.test.ts`**: Added comprehensive tests for HTML to Markdown conversion and round-trip preservation
- **`src/test/compiler.test.ts`**: Updated tests to work with the new attribute naming

## Technical Details

### HTML Attribute Handling

- Fixed HTML attribute parsing issues where JSON content was being split across multiple properties
- Used HTML entity encoding (`&quot;`) to properly escape JSON quotes in HTML attributes
- Implemented proper decoding in the reverse conversion

### Round-trip Preservation

- Ensured fenced JSON blocks remain byte-exact through MD → HTML → MD conversion
- Handled both single and multiple fenced blocks correctly
- Preserved JSON content with proper newline handling

### Plugin Integration

- `rehype-to-remark` plugin correctly identifies placeholder divs by class name
- Converts placeholders back to `<pre><code>` structure with proper language classes
- Maintains JSON content integrity through HTML entity decoding

## Acceptance Criteria Met

✅ Fenced JSON blocks are byte-identical after Visual↔Markdown switch  
✅ Non-block text differs only by whitespace at most  
✅ Round-trip conversion preserves all block types (card, barchart, etc.)  
✅ Multiple fenced blocks handled correctly  
✅ JSON content preserved exactly through conversions

## Test Results

- All converter tests passing (4/4)
- Round-trip conversion tests passing
- Multiple block handling tests passing
- Full test suite: 12/12 tests passing

## Files Modified

- `src/compile/htmlToMd.ts` (new)
- `src/blocks/rehype-to-remark.ts` (new)
- `src/blocks/rehype-placeholders.ts` (enhanced)
- `src/blocks/remark-shadcn-blocks.ts` (enhanced)
- `src/compile/mdToHtml.ts` (sanitization schema update)
- `src/test/converter.test.ts` (new)
- `src/test/compiler.test.ts` (updated)

## Next Steps

Ready to proceed with Issue #36: Dual-Mode Shell with Real-Time Preview
