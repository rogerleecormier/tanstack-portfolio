/**
 * Rehype to Remark converter
 * Converts placeholders back to fenced blocks
 */

import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export function rehypeToRemark() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // Look for shadcn block placeholders
      if (
        node.tagName === 'div' &&
        (node.properties?.className === 'shadcn-block-placeholder' ||
          (Array.isArray(node.properties?.className) &&
            node.properties?.className.includes('shadcn-block-placeholder')))
      ) {
        // HTML attributes with hyphens get converted to camelCase
        const blockType =
          (node.properties?.['dataBlockType'] as string) ||
          (node.properties?.['data-block-type'] as string);
        const blockJson =
          (node.properties?.['dataJson'] as string) ||
          (node.properties?.['data-json'] as string);

        if (blockType && blockJson) {
          // Decode HTML entities and newlines back to JSON
          const actualJsonContent = blockJson
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"');

          // Convert back to fenced code block structure
          node.tagName = 'pre';
          node.properties = {
            className: ['language-' + blockType],
          };

          node.children = [
            {
              type: 'element',
              tagName: 'code',
              properties: {
                className: ['language-' + blockType],
              },
              children: [
                {
                  type: 'text',
                  value: actualJsonContent,
                },
              ],
            },
          ];
        }
      }
    });
  };
}
