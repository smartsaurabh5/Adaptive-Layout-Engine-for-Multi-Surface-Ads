import { describe, it, expect } from 'vitest';
import { validateSchema } from '../validator';
import type { LayoutSchema } from '../types';

const validSchema: LayoutSchema = {
  id: 'layout-valid-1',
  name: 'Summer Campaign',
  backgroundColor: '#ffffff',
  version: 1,
  elements: [
    {
      id: 'logo-1',
      type: 'logo',
      label: 'Brand Logo',
      x: 5,
      y: 5,
      width: 20,
      height: 10,
      anchor: 'top-left',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 2,
      visible: true,
      locked: false,
      props: { src: 'https://example.com/logo.svg', alt: 'Logo', objectFit: 'contain', opacity: 1 },
    },
    {
      id: 'cta-1',
      type: 'button',
      label: 'Shop Now Button',
      x: 30,
      y: 75,
      width: 40,
      height: 15,
      anchor: 'bottom-center',
      scalingStrategy: 'reflow',
      priority: 2,
      zIndex: 3,
      visible: true,
      locked: false,
      props: {
        label: 'Shop Now',
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 8,
        paddingX: 16,
        paddingY: 8,
      },
    },
  ],
};

describe('Layout Schema Validator', () => {
  it('passes a valid schema without errors', () => {
    const result = validateSchema(validSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('warns if schema has no elements', () => {
    const emptySchema: LayoutSchema = {
      ...validSchema,
      elements: [],
    };
    const result = validateSchema(emptySchema);
    expect(result.warnings.some((w) => w.field === 'elements')).toBe(true);
  });

  it('fails if schema has duplicate element IDs', () => {
    const dupSchema: LayoutSchema = {
      ...validSchema,
      elements: [
        validSchema.elements[0],
        { ...validSchema.elements[1], id: validSchema.elements[0].id },
      ],
    };
    const result = validateSchema(dupSchema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Duplicate element IDs'))).toBe(true);
  });

  it('warns if coordinates or dimensions are outside 0-100 percentage range', () => {
    const outOfBoundsSchema: LayoutSchema = {
      ...validSchema,
      elements: [
        {
          ...validSchema.elements[0],
          x: -5,
          width: 120,
        },
      ],
    };
    const result = validateSchema(outOfBoundsSchema);
    expect(result.warnings.some((w) => w.field === 'x')).toBe(true);
    expect(result.warnings.some((w) => w.field === 'width')).toBe(true);
  });

  it('fails if element has an invalid scaling strategy or anchor', () => {
    const invalidStrategySchema: LayoutSchema = {
      ...validSchema,
      elements: [
        {
          ...validSchema.elements[0],
          // @ts-expect-error testing invalid strategy runtime validation
          scalingStrategy: 'magic-scale',
          // @ts-expect-error testing invalid anchor runtime validation
          anchor: 'floating',
        },
      ],
    };
    const result = validateSchema(invalidStrategySchema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'scalingStrategy')).toBe(true);
    expect(result.errors.some((e) => e.field === 'anchor')).toBe(true);
  });

  it('fails if required element fields (label, type) are missing or invalid', () => {
    const invalidTypeSchema: LayoutSchema = {
      ...validSchema,
      elements: [
        {
          ...validSchema.elements[0],
          // @ts-expect-error testing invalid element type
          type: 'video-game',
          label: '',
        },
      ],
    };
    const result = validateSchema(invalidTypeSchema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'type')).toBe(true);
    expect(result.errors.some((e) => e.field === 'label')).toBe(true);
  });
});
