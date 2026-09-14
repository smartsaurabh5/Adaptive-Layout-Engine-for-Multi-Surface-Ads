import { describe, it, expect } from 'vitest';
import {
  applyFit,
  applyFill,
  applyReflow,
  applyHide,
  applyScalingStrategy,
} from '../scalingStrategies';
import type { ElementNode, Surface } from '../types';

const baseElement: ElementNode = {
  id: 'el-1',
  type: 'image',
  label: 'Product Shot',
  x: 10,
  y: 10,
  width: 50,
  height: 40,
  anchor: 'top-left',
  scalingStrategy: 'fit',
  priority: 1,
  zIndex: 1,
  visible: true,
  locked: false,
  props: {
    src: 'https://example.com/img.png',
    alt: 'Test',
    objectFit: 'cover',
    borderRadius: 0,
    opacity: 1,
  },
};

const testSurface: Surface = {
  id: 'surf-banner',
  name: 'Banner',
  width: 300,
  height: 250,
  type: 'banner',
  minSupportedWidth: 200,
};

describe('Scaling Strategies', () => {
  describe('applyFit', () => {
    it('calculates standard base bounds within surface dimensions', () => {
      const resolved = applyFit(baseElement, testSurface);
      expect(resolved.resolvedX).toBe(30); // 10% of 300
      expect(resolved.resolvedY).toBe(25); // 10% of 250
      expect(resolved.resolvedWidth).toBe(150); // 50% of 300
      expect(resolved.resolvedHeight).toBe(100); // 40% of 250
      expect(resolved.hidden).toBe(false);
      expect(resolved.reflowed).toBe(false);
    });

    it('scales down if element bounds exceed surface width', () => {
      const wideElement: ElementNode = {
        ...baseElement,
        x: 60,
        width: 60, // 60% of 300 = 180, total 180 + 180 = 360 > 300
        height: 40,
      };
      const resolved = applyFit(wideElement, testSurface);
      expect((resolved.resolvedX ?? 0) + (resolved.resolvedWidth ?? 0)).toBeLessThanOrEqual(testSurface.width);
      expect(resolved.hidden).toBe(false);
    });
  });

  describe('applyFill', () => {
    it('scales element maintaining aspect ratio to cover area', () => {
      const resolved = applyFill(baseElement, testSurface);
      expect(resolved.resolvedWidth).toBeGreaterThan(0);
      expect(resolved.resolvedHeight).toBeGreaterThan(0);
      expect(resolved.hidden).toBe(false);
    });
  });

  describe('applyReflow', () => {
    it('does not reflow if surface width is above minSupportedWidth', () => {
      const resolved = applyReflow(baseElement, testSurface, 50);
      expect(resolved.reflowed).toBe(false);
      expect(resolved.resolvedX).toBe(30);
    });

    it('reflows with 5% padding and stacked offset if surface width is below minSupportedWidth', () => {
      const narrowSurface: Surface = {
        ...testSurface,
        width: 150, // below minSupportedWidth of 200
      };
      const resolved = applyReflow(baseElement, narrowSurface, 75);
      expect(resolved.reflowed).toBe(true);
      expect(resolved.resolvedX).toBe(150 * 0.05); // 7.5
      expect(resolved.resolvedY).toBe(75);
      expect(resolved.resolvedWidth).toBe(150 - 15); // 135
    });
  });

  describe('applyHide', () => {
    it('does not hide element when surface width is greater than minWidth', () => {
      const elWithMin: ElementNode = {
        ...baseElement,
        scalingStrategy: 'hide',
        minWidth: 250,
      };
      const resolved = applyHide(elWithMin, testSurface); // width is 300 >= 250
      expect(resolved.hidden).toBe(false);
    });

    it('hides element when surface width is less than minWidth', () => {
      const elWithMin: ElementNode = {
        ...baseElement,
        scalingStrategy: 'hide',
        minWidth: 400, // 300 < 400
      };
      const resolved = applyHide(elWithMin, testSurface);
      expect(resolved.hidden).toBe(true);
    });
  });

  describe('applyScalingStrategy dispatch', () => {
    it('correctly dispatches each strategy name', () => {
      expect(applyScalingStrategy({ ...baseElement, scalingStrategy: 'fit' }, testSurface).hidden).toBe(false);
      expect(applyScalingStrategy({ ...baseElement, scalingStrategy: 'fill' }, testSurface).hidden).toBe(false);
      expect(applyScalingStrategy({ ...baseElement, scalingStrategy: 'hide', minWidth: 500 }, testSurface).hidden).toBe(true);
      expect(applyScalingStrategy({ ...baseElement, scalingStrategy: 'reflow' }, { ...testSurface, width: 100 }, 10).reflowed).toBe(true);
    });
  });
});
