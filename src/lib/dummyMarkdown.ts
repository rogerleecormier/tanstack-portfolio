export const DUMMY_MARKDOWN = `# Welcome to Markdown Editor

This is a **comprehensive example** of various *markdown elements* that you can use in your content.

## Headings

### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading

## Text Formatting

- **Bold text** or __bold text__
- *Italic text* or _italic text_
- ***Bold and italic*** or ___bold and italic___
- ~~Strikethrough text~~
- \`Inline code\` formatting
- [Links](https://example.com) with titles
- [Reference links][ref-link]

## Lists

### Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered Lists
1. First item
2. Second item
   1. Nested ordered item
   2. Another nested item
3. Third item

### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

## Blockquotes

> This is a blockquote
>
> It can span multiple lines
>
>> And can be nested

## Code Blocks

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
  return true;
}
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Info     | Content  |
| Row 3    | Text     | Values   |

### Aligned Tables

| Left | Center | Right |
|------|:------:|------:|
| Text | Text   | Text  |
| More | Data   | Info  |

## Images

![Alt text for image](https://via.placeholder.com/300x200?text=Sample+Image)

## Horizontal Rules

---

## Footnotes

This is some text with a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2 with multiple lines
: Second definition for term 2

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

## Mathematical Expressions

Inline math: $E = mc^2$

Block math:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

## HTML in Markdown

<div class="custom-class">
  <p>This is <strong>HTML</strong> mixed with Markdown.</p>
</div>

## Escaping Characters

\\*Not italic\\* and \\${'`'}not code\\${'`'}

[ref-link]: https://example.com/reference-link

`;
