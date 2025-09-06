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

            // Parse JSON to get a summary for screen readers
            let blockSummary = `${blockType} block`;
            try {
              const parsedJson = JSON.parse(jsonContent);
              if (parsedJson.title) {
                blockSummary = `${blockType} block: ${parsedJson.title}`;
              } else if (parsedJson.label) {
                blockSummary = `${blockType} block: ${parsedJson.label}`;
              } else if (parsedJson.name) {
                blockSummary = `${blockType} block: ${parsedJson.name}`;
              }
            } catch {
              // If JSON parsing fails, use default summary
            }

            // Convert the pre element to a placeholder div with accessibility attributes
            node.tagName = 'div';
            node.properties = {
              class: 'shadcn-block-placeholder',
              'data-block-type': blockType,
              'data-json': jsonContent
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '\\n'), // Escape quotes and newlines
              contentEditable: 'false',
              role: 'img',
              'aria-label': blockSummary,
              'aria-describedby': `block-description-${blockType}`,
              tabIndex: 0,
            };
            node.children = [
              {
                type: 'text' as const,
                value: `[${blockType.toUpperCase()} BLOCK]`,
              },
              {
                type: 'element' as const,
                tagName: 'span',
                properties: {
                  id: `block-description-${blockType}`,
                  class: 'sr-only',
                },
                children: [
                  {
                    type: 'text' as const,
                    value: `This is a ${blockType} block. ${blockSummary}. Use the block editor to configure this component.`,
                  },
                ],
              },
            ];
          }
        }
      }
    });
  };
}
