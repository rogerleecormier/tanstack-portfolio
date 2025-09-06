# Fenced Block Detection & Placeholders

**Labels:** blocks

## Description

Goal: Detect fenced JSON blocks and protect them as atomic widgets.

## Tasks

- remark-shadcn-blocks: detect code nodes with languages in {card, barchart, linechart, scatterplot, tablejson, …}; attach metadata; tolerant JSON parse.
- rehype-placeholders: convert <pre><code class="language-…">…</code></pre> into noneditable placeholders with data-block-type and data-block-json.
- TinyMCE: enable noneditable plugin; map class to non-editable.

## Acceptance Criteria

- In Visual mode, blocks are atomic and cannot be edited inline or broken by backspace/delete.
