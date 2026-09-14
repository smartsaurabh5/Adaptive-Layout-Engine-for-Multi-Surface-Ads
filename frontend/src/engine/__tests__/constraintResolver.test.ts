import { describe, it, expect } from 'vitest';
import { resolveLayout } from '../constraintResolver';
import { DEFAULT_SURFACES } from '../engine';
import type { LayoutSchema } from '../types';

const mockSchema: LayoutSchema = {
  id: 'layout-test-engine',
  name: 'Multi Surface Promo',
  backgroundColor: '#0f172a',
  version: 1,
  elements: [
    {
      id: 'logo',
      type: 'logo',
      label: 'Brand Logo',
      x: 5,
      y: 5,
      width: 25,
      height: 12,
      anchor: 'top-left',
      scalingStrategy: 'fit',
      priority: 1,
      zIndex: 10,
      visible: true,
      locked: false,
      props: { src: 'https://example.com/logo.svg', alt: 'Brand Logo', objectFit: 'contain', opacity: 1 },
    },
    {
      id: 'headline',
      type: 'text',
      label: 'Main Headline',
      x: 10,
      y: 35,
      width: 80,
      height: 20,
      anchor: 'center',
      scalingStrategy: 'reflow',
      priority: 2,
      zIndex: 5,
      visible: true,
      locked: false,
      props: {
        content: 'Adaptive Layouts Everywhere',
        fontSize: 24,
        fontWeight: 700,
        fontFamily: 'Inter',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    },
    {
      id: 'cta-btn',
      type: 'button',
      label: 'Call to Action',
      x: 30,
      y: 80,
      width: 40,
      height: 12,
      anchor: 'bottom-center',
      scalingStrategy: 'fit',
      priority: 3,
      zIndex: 6,
      visible: true,
      locked: false,
      props: {
        label: 'Explore Now',
        backgroundColor: '#6366f1',
        textColor: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 8,
        paddingX: 16,
        paddingY: 8,
      },
    },
    {
      id: 'optional-badge',
      type: 'shape',
      label: 'Promotion Badge',
      x: 75,
      y: 5,
      width: 20,
      height: 10,
      anchor: 'top-right',
      scalingStrategy: 'hide',
      minWidth: 300, // hidden on surfaces narrower than 300px (e.g. skyscraper 160px)
      priority: 4,
      zIndex: 7,
      visible: true,
      locked: false,
      props: {
        shapeType: 'pill',
        backgroundColor: '#e11d48',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 9999,
        opacity: 1,
      },
    },
  ],
};

describe('Constraint Resolver', () => {
  it('resolves elements to absolute pixel coordinates matching surface dimensions', () => {
    const squareSurface = DEFAULT_SURFACES.find((s) => s.type === 'square')!;
    const tree = resolveLayout(mockSchema, squareSurface);

    expect(tree.surface.width).toBe(1080);
    expect(tree.surface.height).toBe(1080);
    expect(tree.elements).toHaveLength(4);

    const logo = tree.elements.find((e) => e.id === 'logo')!;
    expect(logo.resolvedX).toBe(54); // 5% of 1080
    expect(logo.resolvedY).toBe(54); // 5% of 1080
    expect(logo.hidden).toBe(false);
  });

  it('correctly adapts coordinates differently across 5 distinct surfaces', () => {
    const results = DEFAULT_SURFACES.map((surface) => ({
      surfaceType: surface.type,
      tree: resolveLayout(mockSchema, surface),
    }));

    expect(results).toHaveLength(5);

    // Verify each surface produces distinct pixel bounds for the elements
    const logoPositions = results.map((r) => ({
      surface: r.surfaceType,
      x: r.tree.elements.find((e) => e.id === 'logo')?.resolvedX,
      width: r.tree.elements.find((e) => e.id === 'logo')?.resolvedWidth,
    }));

    // Square (1080px) vs Banner (300px) vs Skyscraper (160px) vs Leaderboard (728px)
    const squareLogo = logoPositions.find((p) => p.surface === 'square');
    const bannerLogo = logoPositions.find((p) => p.surface === 'banner');
    const skyLogo = logoPositions.find((p) => p.surface === 'skyscraper');

    expect(squareLogo?.width).toBeGreaterThan(bannerLogo?.width ?? 0);
    expect(bannerLogo?.width).toBeGreaterThan(skyLogo?.width ?? 0);
  });

  it('hides elements with hide strategy when surface is below minWidth', () => {
    const skyscraper = DEFAULT_SURFACES.find((s) => s.type === 'skyscraper')!; // width 160 < minWidth 300
    const tree = resolveLayout(mockSchema, skyscraper);

    const badge = tree.elements.find((e) => e.id === 'optional-badge')!;
    expect(badge.hidden).toBe(true);

    const square = DEFAULT_SURFACES.find((s) => s.type === 'square')!; // width 1080 >= 300
    const squareTree = resolveLayout(mockSchema, square);
    const squareBadge = squareTree.elements.find((e) => e.id === 'optional-badge')!;
    expect(squareBadge.hidden).toBe(false);
  });

  it('handles center anchor properly', () => {
    const banner = DEFAULT_SURFACES.find((s) => s.type === 'banner')!; // 300x250
    const tree = resolveLayout(mockSchema, banner);
    const headline = tree.elements.find((e) => e.id === 'headline')!;

    // Center anchor recalculates x & y based on element resolved dimensions
    expect(headline.resolvedX).toBeGreaterThanOrEqual(0);
    expect(headline.resolvedY).toBeGreaterThanOrEqual(0);
  });
});
