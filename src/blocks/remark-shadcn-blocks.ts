/**
 * Remark plugin for shadcn blocks
 * Detects and processes fenced JSON blocks
 */

import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';

const BLOCK_TYPES = [
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

export function remarkShadcnBlocks() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (!node.lang || !BLOCK_TYPES.includes(node.lang)) {
        return;
      }

      // Try to parse JSON content
      let blockData: unknown;
      try {
        blockData = JSON.parse(node.value);
      } catch {
        // If JSON parsing fails, keep as string
        blockData = node.value;
      }

      // Attach metadata to the node
      (node as unknown as Record<string, unknown>).data = {
        ...(((node as unknown as Record<string, unknown>).data as Record<
          string,
          unknown
        >) || {}),
        blockType: node.lang,
        blockData: blockData,
        isShadcnBlock: true,
        hProperties: {
          className: `language-${node.lang}`,
        },
      };

      // The lang property is already set correctly
    });
  };
}
