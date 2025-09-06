import { describe, it, expect } from 'vitest';
import {
  validateBlockData,
  getBlockSchema,
  getSupportedBlockTypes,
} from '../blocks/schemas';

describe('Block Schemas', () => {
  describe('Schema Validation', () => {
    it('should validate card blocks correctly', () => {
      const validCard = {
        title: 'Test Card',
        content: 'This is a test card',
        actions: [{ label: 'Learn More', url: 'https://example.com' }],
      };

      const result = validateBlockData('card', validCard);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid card blocks', () => {
      const invalidCard = {
        // Missing required title
        content: 'This is a test card',
      };

      const result = validateBlockData('card', invalidCard);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "root: must have required property 'title'"
      );
    });

    it('should validate barchart blocks correctly', () => {
      const validBarchart = {
        title: 'Sales Data',
        data: [
          { name: 'Q1', value: 100 },
          { name: 'Q2', value: 150 },
          { name: 'Q3', value: 200 },
        ],
      };

      const result = validateBlockData('barchart', validBarchart);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid barchart blocks', () => {
      const invalidBarchart = {
        title: 'Sales Data',
        data: [
          { name: 'Q1' }, // Missing required value
        ],
      };

      const result = validateBlockData('barchart', invalidBarchart);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "data/0: must have required property 'value'"
      );
    });

    it('should validate linechart blocks correctly', () => {
      const validLinechart = {
        title: 'Trend Analysis',
        series: [
          {
            name: 'Revenue',
            data: [
              { x: 1, y: 100 },
              { x: 2, y: 150 },
              { x: 3, y: 200 },
            ],
          },
        ],
      };

      const result = validateBlockData('linechart', validLinechart);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid linechart blocks', () => {
      const invalidLinechart = {
        title: 'Trend Analysis',
        series: [
          {
            name: 'Revenue',
            data: [
              { x: 1 }, // Missing required y
            ],
          },
        ],
      };

      const result = validateBlockData('linechart', invalidLinechart);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "series/0/data/0: must have required property 'y'"
      );
    });

    it('should validate tablejson blocks correctly', () => {
      const validTable = {
        title: 'User Data',
        columns: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        data: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
      };

      const result = validateBlockData('tablejson', validTable);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid tablejson blocks', () => {
      const invalidTable = {
        title: 'User Data',
        columns: [
          { key: 'name' }, // Missing required label
        ],
        data: [],
      };

      const result = validateBlockData('tablejson', invalidTable);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "columns/0: must have required property 'label'"
      );
    });

    it('should validate progress blocks correctly', () => {
      const validProgress = {
        value: 75,
        max: 100,
        label: 'Loading...',
        showValue: true,
      };

      const result = validateBlockData('progress', validProgress);
      expect(result.valid).toBe(true);
    });

    it('should reject progress blocks with invalid values', () => {
      const invalidProgress = {
        value: 150, // Exceeds maximum of 100
        max: 100,
      };

      const result = validateBlockData('progress', invalidProgress);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('value: must be <= 100');
    });

    it('should validate gauge blocks correctly', () => {
      const validGauge = {
        value: 65,
        min: 0,
        max: 100,
        label: 'CPU Usage',
        color: '#3b82f6',
        size: 200,
      };

      const result = validateBlockData('gauge', validGauge);
      expect(result.valid).toBe(true);
    });

    it('should reject gauge blocks with invalid color format', () => {
      const invalidGauge = {
        value: 65,
        color: 'blue', // Invalid hex color format
      };

      const result = validateBlockData('gauge', invalidGauge);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'color: must match pattern "^#[0-9A-Fa-f]{6}$"'
      );
    });

    it('should validate alert blocks correctly', () => {
      const validAlert = {
        title: 'Warning',
        message: 'This is a warning message',
        variant: 'destructive',
        dismissible: true,
      };

      const result = validateBlockData('alert', validAlert);
      expect(result.valid).toBe(true);
    });

    it('should reject alert blocks with invalid variant', () => {
      const invalidAlert = {
        title: 'Warning',
        message: 'This is a warning message',
        variant: 'invalid', // Invalid variant
      };

      const result = validateBlockData('alert', invalidAlert);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'variant: must be equal to one of the allowed values'
      );
    });

    it('should validate button blocks correctly', () => {
      const validButton = {
        label: 'Click Me',
        url: 'https://example.com',
        variant: 'default',
        size: 'lg',
        disabled: false,
      };

      const result = validateBlockData('button', validButton);
      expect(result.valid).toBe(true);
    });

    it('should reject button blocks with invalid URL format', () => {
      const invalidButton = {
        label: 'Click Me',
        url: 'not-a-valid-url', // Invalid URL format
      };

      const result = validateBlockData('button', invalidButton);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('url: must match format "uri"');
    });
  });

  describe('Schema Utilities', () => {
    it('should get schema for valid block types', () => {
      const cardSchema = getBlockSchema('card');
      expect(cardSchema).toBeDefined();
      expect(cardSchema?.type).toBe('object');
      expect(cardSchema?.required).toContain('title');

      const barchartSchema = getBlockSchema('barchart');
      expect(barchartSchema).toBeDefined();
      expect(barchartSchema?.required).toContain('title');
      expect(barchartSchema?.required).toContain('data');
    });

    it('should return null for invalid block types', () => {
      const invalidSchema = getBlockSchema('invalidtype');
      expect(invalidSchema).toBeNull();
    });

    it('should return all supported block types', () => {
      const supportedTypes = getSupportedBlockTypes();
      expect(supportedTypes).toContain('card');
      expect(supportedTypes).toContain('barchart');
      expect(supportedTypes).toContain('linechart');
      expect(supportedTypes).toContain('scatterplot');
      expect(supportedTypes).toContain('histogram');
      expect(supportedTypes).toContain('tablejson');
      expect(supportedTypes).toContain('alert');
      expect(supportedTypes).toContain('button');
      expect(supportedTypes).toContain('progress');
      expect(supportedTypes).toContain('gauge');
    });

    it('should handle unknown block types gracefully', () => {
      const result = validateBlockData('unknown', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown block type: unknown');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      const result = validateBlockData('card', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "root: must have required property 'title'"
      );
    });

    it('should handle null values', () => {
      const result = validateBlockData('card', null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('root: must be object');
    });

    it('should handle undefined values', () => {
      const result = validateBlockData('card', undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('root: must be object');
    });

    it('should handle arrays with minimum items', () => {
      const barchartWithEmptyData = {
        title: 'Empty Chart',
        data: [], // Should fail minItems: 1
      };

      const result = validateBlockData('barchart', barchartWithEmptyData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data: must NOT have fewer than 1 items');
    });

    it('should handle string length validation', () => {
      const cardWithEmptyTitle = {
        title: '', // Should fail minLength: 1
      };

      const result = validateBlockData('card', cardWithEmptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'title: must NOT have fewer than 1 characters'
      );
    });
  });
});
