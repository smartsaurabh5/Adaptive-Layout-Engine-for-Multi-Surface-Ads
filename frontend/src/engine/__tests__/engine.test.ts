import { describe, it, expect } from 'vitest';
import {
  createBlankSchema,
  getSupportedSurfaces,
  resolveAndValidate,
  DEFAULT_SURFACES,
} from '../engine';
import type { LayoutSchema } from '../types';

describe('Layout Engine Public Entrypoint', () => {
  it('creates a blank schema with defaults', () => {
    const blank = createBlankSchema('My New Ad');
    expect(blank.name).toBe('My New Ad');
    expect(blank.elements).toEqual([]);
    expect(blank.version).toBe(1);
    expect(blank.backgroundColor).toBe('#ffffff');
    expect(blank.id).toContain('layout-');
  });

  it('returns standard 5 supported surfaces', () => {
    const surfaces = getSupportedSurfaces();
    expect(surfaces).toHaveLength(5);
    const types = surfaces.map((s) => s.type);
    expect(types).toContain('banner');
    expect(types).toContain('leaderboard');
    expect(types).toContain('square');
    expect(types).toContain('story');
    expect(types).toContain('skyscraper');
  });

  it('validates and resolves in one call with resolveAndValidate', () => {
    const schema: LayoutSchema = {
      id: 'valid-test-1',
      name: 'Test Ad',
      backgroundColor: '#000000',
      version: 1,
      elements: [
        {
          id: 'text-1',
          type: 'text',
          label: 'Header',
          x: 10,
          y: 10,
          width: 80,
          height: 20,
          anchor: 'top-center',
          scalingStrategy: 'fit',
          priority: 1,
          zIndex: 1,
          visible: true,
          locked: false,
          props: {
            content: 'Hello World',
            fontSize: 18,
            fontWeight: 600,
            fontFamily: 'Inter',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: 0,
          },
        },
      ],
    };

    const surface = DEFAULT_SURFACES[0];
    const { renderTree, validation } = resolveAndValidate(schema, surface);

    expect(validation.valid).toBe(true);
    expect(renderTree.surface.id).toBe(surface.id);
    expect(renderTree.elements).toHaveLength(1);
    expect(renderTree.elements[0].resolvedWidth).toBeGreaterThan(0);
  });
});
