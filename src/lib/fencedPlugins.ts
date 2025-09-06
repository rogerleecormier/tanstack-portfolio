import { Plugin } from 'unified';
import { Root, Code } from 'mdast';
import { cardSchema } from '../schemas/card';
import { chartSchema } from '../schemas/chart';

interface FencedBlock {
  type: 'card' | 'chart' | 'component';
  componentType?: string;
  json: string;
}

export const fencedPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const codeNodes: Code[] = [];

    // Find all code nodes that might be fenced blocks
    const findCodeNodes = (node: unknown) => {
      const nodeObj = node as Record<string, unknown>;
      if (nodeObj.type === 'code') {
        codeNodes.push(nodeObj as unknown as Code);
      }
      if (nodeObj.children && Array.isArray(nodeObj.children)) {
        nodeObj.children.forEach(findCodeNodes);
      }
    };

    tree.children.forEach(findCodeNodes);

    codeNodes.forEach((node: Code) => {
      const parsed = parseFencedBlock(node.value);
      if (parsed) {
        // Replace the code node with our custom HAST node
        Object.assign(node, {
          type: 'html',
          value: `<x-fenced-${parsed.type} data-json="${encodeURIComponent(parsed.json)}"></x-fenced-${parsed.type}>`,
          data: {
            hName: `x-fenced-${parsed.type}`,
            hProperties: {
              'data-json': parsed.json,
              ...(parsed.componentType && { 'data-component-type': parsed.componentType }),
            },
          },
        });
      }
    });
  };
};

function parseFencedBlock(content: string): FencedBlock | null {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return null;

  const firstLine = lines[0].trim();

  // Check for card {json}
  if (firstLine.startsWith('card ')) {
    const jsonStr = firstLine.substring(5).trim();
    if (isValidJson(jsonStr, cardSchema)) {
      return { type: 'card', json: jsonStr };
    }
  }

  // Check for chart {json}
  if (firstLine.startsWith('chart ')) {
    const jsonStr = firstLine.substring(6).trim();
    if (isValidJson(jsonStr, chartSchema)) {
      return { type: 'chart', json: jsonStr };
    }
  }

  // Check for component:<type> {json}
  if (firstLine.startsWith('component:')) {
    const colonIndex = firstLine.indexOf(':');
    const spaceIndex = firstLine.indexOf(' ', colonIndex);
    if (spaceIndex !== -1) {
      const componentType = firstLine.substring(colonIndex + 1, spaceIndex).trim();
      const jsonStr = firstLine.substring(spaceIndex).trim();
      if (isValidJson(jsonStr)) {
        return { type: 'component', componentType, json: jsonStr };
      }
    }
  }

  return null;
}

function isValidJson(jsonStr: string, schema?: { safeParse: (data: unknown) => { success: boolean } }): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
