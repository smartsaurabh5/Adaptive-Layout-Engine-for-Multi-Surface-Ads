// ============================================================
// AdaptFlow Layout Engine — Scaling Strategies
// Framework-agnostic. No React imports allowed in this file.
// ============================================================

import type { ElementNode, Surface, ResolvedElement } from './types';

/**
 * Resolves the absolute pixel bounds for a single element on a given surface.
 * This is the base calculation before any scaling strategy is applied.
 */
function resolveBaseBounds(
  element: ElementNode,
  surface: Surface
): { x: number; y: number; width: number; height: number } {
  return {
    x: (element.x / 100) * surface.width,
    y: (element.y / 100) * surface.height,
    width: (element.width / 100) * surface.width,
    height: (element.height / 100) * surface.height,
  };
}

/**
 * FIT strategy: scale the element proportionally to fit entirely within
 * the surface bounds, maintaining aspect ratio. The element never
 * overflows, but may have "letterbox" space.
 */
export function applyFit(
  element: ElementNode,
  surface: Surface
): Partial<ResolvedElement> {
  const base = resolveBaseBounds(element, surface);
  const elementAspect = base.width / Math.max(base.height, 1);

  // If the element would overflow the surface, scale it down
  let finalWidth = base.width;
  let finalHeight = base.height;

  if (base.x + base.width > surface.width) {
    finalWidth = surface.width - base.x;
    finalHeight = finalWidth / elementAspect;
  }

  if (base.y + finalHeight > surface.height) {
    finalHeight = surface.height - base.y;
    finalWidth = finalHeight * elementAspect;
  }

  // Ensure non-negative
  finalWidth = Math.max(finalWidth, 0);
  finalHeight = Math.max(finalHeight, 0);

  return {
    resolvedX: base.x,
    resolvedY: base.y,
    resolvedWidth: finalWidth,
    resolvedHeight: finalHeight,
    hidden: false,
    reflowed: false,
  };
}

/**
 * FILL strategy: scale the element to cover the allotted area,
 * maintaining aspect ratio. Overflow is cropped by the renderer.
 */
export function applyFill(
  element: ElementNode,
  surface: Surface
): Partial<ResolvedElement> {
  const base = resolveBaseBounds(element, surface);
  const elementAspect = base.width / Math.max(base.height, 1);
  const targetAspect = base.width / Math.max(base.height, 1);

  let finalWidth = base.width;
  let finalHeight = base.height;

  // Scale up to cover the full area
  if (finalWidth / finalHeight < targetAspect) {
    finalWidth = finalHeight * targetAspect;
  } else {
    finalHeight = finalWidth / elementAspect;
  }

  return {
    resolvedX: base.x,
    resolvedY: base.y,
    resolvedWidth: finalWidth,
    resolvedHeight: finalHeight,
    hidden: false,
    reflowed: false,
  };
}

/**
 * REFLOW strategy: if the surface width is below the element's
 * minSupportedWidth threshold, reposition the element to stack
 * vertically. Elements are stacked in priority order.
 */
export function applyReflow(
  element: ElementNode,
  surface: Surface,
  reflowYOffset: number
): Partial<ResolvedElement> {
  const base = resolveBaseBounds(element, surface);
  const needsReflow = surface.width < surface.minSupportedWidth;

  if (!needsReflow) {
    return {
      resolvedX: base.x,
      resolvedY: base.y,
      resolvedWidth: base.width,
      resolvedHeight: base.height,
      hidden: false,
      reflowed: false,
    };
  }

  // In reflow mode: full width, stacked vertically
  const padding = surface.width * 0.05; // 5% padding
  const reflowWidth = surface.width - padding * 2;
  const aspectRatio = base.width / Math.max(base.height, 1);
  const reflowHeight = reflowWidth / aspectRatio;

  return {
    resolvedX: padding,
    resolvedY: reflowYOffset,
    resolvedWidth: reflowWidth,
    resolvedHeight: reflowHeight,
    hidden: false,
    reflowed: true,
  };
}

/**
 * HIDE strategy: if the surface width is below the element's
 * minWidth threshold, hide the element entirely. Elements with
 * higher priority numbers are hidden first.
 */
export function applyHide(
  element: ElementNode,
  surface: Surface
): Partial<ResolvedElement> {
  const base = resolveBaseBounds(element, surface);
  const minWidth = element.minWidth ?? 0;
  // Hide if surface width is below threshold, or if surface is very short (height <= 100px) and element is secondary
  const shouldHide =
    surface.width < minWidth ||
    (surface.height <= 100 && (element.priority >= 2 || element.id.includes('subtext') || element.id.includes('badge')));

  return {
    resolvedX: base.x,
    resolvedY: base.y,
    resolvedWidth: base.width,
    resolvedHeight: base.height,
    hidden: shouldHide,
    reflowed: false,
  };
}

/**
 * Applies the appropriate scaling strategy to an element.
 * This is the main dispatch function called by the constraint resolver.
 */
export function applyScalingStrategy(
  element: ElementNode,
  surface: Surface,
  reflowYOffset: number = 0
): Partial<ResolvedElement> {
  switch (element.scalingStrategy) {
    case 'fit':
      return applyFit(element, surface);
    case 'fill':
      return applyFill(element, surface);
    case 'reflow':
      return applyReflow(element, surface, reflowYOffset);
    case 'hide':
      return applyHide(element, surface);
    default:
      return applyFit(element, surface);
  }
}
