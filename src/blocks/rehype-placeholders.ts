/**
 * Rehype plugin for placeholders
 * Converts fenced blocks to non-editable placeholders
 */

import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export function rehypePlaceholders() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      // Look for <pre><code> elements that represent fenced blocks
      if (node.tagName === 'pre' && node.children.length === 1) {
        const codeElement = node.children[0] as Element;
        if (codeElement.type === 'element' && codeElement.tagName === 'code') {
          const className = codeElement.properties?.className;

          // Check if this is a shadcn block - try both string and array formats
          let blockType: string | null = null;
          if (
            typeof className === 'string' &&
            className.startsWith('language-')
          ) {
            blockType = className.replace('language-', '');
          } else if (
            Array.isArray(className) &&
            className.some(
              (cls) => typeof cls === 'string' && cls.startsWith('language-')
            )
          ) {
            const langClass = className.find(
              (cls) => typeof cls === 'string' && cls.startsWith('language-')
            ) as string;
            blockType = langClass.replace('language-', '');
          }

          // Only create placeholders for valid block types
          const VALID_BLOCK_TYPES = [
            'card',
            'barchart',
            'linechart',
            'scatterplot',
            'tablejson',
            'histogram',
            'piechart',
            'donutchart',
            'areachart',
            'radarchart',
            'gauge',
            'progress',
            'alert',
            'badge',
            'button',
            'input',
            'textarea',
            'select',
            'checkbox',
            'radio',
            'switch',
            'slider',
            'tabs',
            'accordion',
            'carousel',
            'modal',
            'tooltip',
            'popover',
            'dropdown',
            'menu',
            'breadcrumb',
            'pagination',
            'stepper',
            'timeline',
            'avatar',
            'skeleton',
            'spinner',
            'divider',
            'separator',
          ];

          if (blockType && !VALID_BLOCK_TYPES.includes(blockType)) {
            blockType = null; // Don't create placeholder for invalid block types
          }

          if (blockType) {
            // Get the JSON content from the code element
            const jsonContent = codeElement.children
              .filter((child) => child.type === 'text')
              .map((child) => (child as { value: string }).value)
              .join('');

            // Convert the pre element to a placeholder div
            node.tagName = 'div';
            node.properties = {
              class: 'shadcn-block-placeholder',
              'data-block-type': blockType,
              'data-json': jsonContent
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '\\n'), // Escape quotes and newlines
              contentEditable: 'false',
            };
            node.children = [
              {
                type: 'text' as const,
                value: `[${blockType.toUpperCase()} BLOCK]`,
              },
            ];
          }
        }
      }
    });
  };
}
