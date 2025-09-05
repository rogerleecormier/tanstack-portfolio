/**
 * JSON Schemas for Block Types
 * Defines validation schemas for different block types
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Initialize Ajv with formats support
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export interface BlockSchema {
  type: string;
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties?: boolean;
}

// Define schemas for different block types
export const blockSchemas: Record<string, BlockSchema> = {
  card: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      content: { type: 'string' },
      actions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', minLength: 1 },
            url: { type: 'string', format: 'uri' },
            variant: {
              type: 'string',
              enum: [
                'default',
                'destructive',
                'outline',
                'secondary',
                'ghost',
                'link',
              ],
            },
          },
          required: ['label'],
          additionalProperties: false,
        },
      },
      variant: {
        type: 'string',
        enum: ['default', 'destructive', 'outline', 'secondary'],
      },
      size: { type: 'string', enum: ['sm', 'default', 'lg'] },
    },
    required: ['title'],
    additionalProperties: false,
  },

  barchart: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            value: { type: 'number' },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
          required: ['name', 'value'],
          additionalProperties: false,
        },
        minItems: 1,
      },
      xAxis: { type: 'string' },
      yAxis: { type: 'string' },
      height: { type: 'number', minimum: 200, maximum: 800 },
      showLegend: { type: 'boolean' },
    },
    required: ['title', 'data'],
    additionalProperties: false,
  },

  linechart: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      series: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
                required: ['x', 'y'],
                additionalProperties: false,
              },
              minItems: 2,
            },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
          required: ['name', 'data'],
          additionalProperties: false,
        },
        minItems: 1,
      },
      xAxis: { type: 'string' },
      yAxis: { type: 'string' },
      height: { type: 'number', minimum: 200, maximum: 800 },
      showLegend: { type: 'boolean' },
    },
    required: ['title', 'series'],
    additionalProperties: false,
  },

  scatterplot: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            label: { type: 'string' },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          },
          required: ['x', 'y'],
          additionalProperties: false,
        },
        minItems: 1,
      },
      xAxis: { type: 'string' },
      yAxis: { type: 'string' },
      height: { type: 'number', minimum: 200, maximum: 800 },
      showLegend: { type: 'boolean' },
    },
    required: ['title', 'data'],
    additionalProperties: false,
  },

  histogram: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      data: {
        type: 'array',
        items: { type: 'number' },
        minItems: 1,
      },
      bins: { type: 'number', minimum: 2, maximum: 50 },
      xAxis: { type: 'string' },
      yAxis: { type: 'string' },
      height: { type: 'number', minimum: 200, maximum: 800 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    },
    required: ['title', 'data'],
    additionalProperties: false,
  },

  tablejson: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      columns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', minLength: 1 },
            label: { type: 'string', minLength: 1 },
            type: {
              type: 'string',
              enum: ['string', 'number', 'date', 'boolean'],
            },
          },
          required: ['key', 'label'],
          additionalProperties: false,
        },
        minItems: 1,
      },
      data: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true,
        },
      },
      pageSize: { type: 'number', minimum: 5, maximum: 100 },
      sortable: { type: 'boolean' },
      filterable: { type: 'boolean' },
    },
    required: ['title', 'columns', 'data'],
    additionalProperties: false,
  },

  alert: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      message: { type: 'string', minLength: 1 },
      variant: { type: 'string', enum: ['default', 'destructive'] },
      dismissible: { type: 'boolean' },
    },
    required: ['title', 'message'],
    additionalProperties: false,
  },

  button: {
    type: 'object',
    properties: {
      label: { type: 'string', minLength: 1 },
      url: { type: 'string', format: 'uri' },
      variant: {
        type: 'string',
        enum: [
          'default',
          'destructive',
          'outline',
          'secondary',
          'ghost',
          'link',
        ],
      },
      size: { type: 'string', enum: ['default', 'sm', 'lg', 'icon'] },
      disabled: { type: 'boolean' },
    },
    required: ['label'],
    additionalProperties: false,
  },

  progress: {
    type: 'object',
    properties: {
      value: { type: 'number', minimum: 0, maximum: 100 },
      max: { type: 'number', minimum: 1, default: 100 },
      label: { type: 'string' },
      showValue: { type: 'boolean' },
    },
    required: ['value'],
    additionalProperties: false,
  },

  gauge: {
    type: 'object',
    properties: {
      value: { type: 'number', minimum: 0, maximum: 100 },
      min: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      label: { type: 'string' },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      size: { type: 'number', minimum: 100, maximum: 400 },
    },
    required: ['value'],
    additionalProperties: false,
  },
};

// Compile schemas for validation
export const compiledSchemas: Record<string, Ajv.ValidateFunction> = {};

Object.keys(blockSchemas).forEach((blockType) => {
  const schema = blockSchemas[blockType];
  compiledSchemas[blockType] = ajv.compile(schema);
});

// Validation function
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

// Get schema for a block type
export function getBlockSchema(blockType: string): BlockSchema | null {
  return blockSchemas[blockType] || null;
}

// Get all supported block types
export function getSupportedBlockTypes(): string[] {
  return Object.keys(blockSchemas);
}
