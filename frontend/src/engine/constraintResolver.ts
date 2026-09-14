// ============================================================
// AdaptFlow Layout Engine — Constraint Resolver
// Framework-agnostic. No React imports allowed in this file.
//
// This is the core algorithm of AdaptFlow. Given a LayoutSchema
// and a target Surface, it resolves every element's absolute
// pixel position by:
//   1. Converting percentage positions → absolute pixels
//   2. Applying anchor constraints (pin-to-corner/edge)
//   3. Applying scaling strategies (fit/fill/reflow/hide)
//   4. Sorting by priority for reflow ordering
// ============================================================

import type {
  LayoutSchema,
  Surface,
  ElementNode,
  ResolvedElement,
  RenderTree,
} from './types';
import { applyScalingStrategy } from './scalingStrategies';

/**
 * Adjusts an element's resolved position based on its anchor constraint.
 * Anchors pin the element relative to a specific corner/edge/center
 * of the surface, so when the surface changes size the element
 * gravitates toward its anchor point.
 */
function applyAnchorConstraint(
  element: ElementNode,
  resolved: Partial<ResolvedElement>,
  surface: Surface
): Partial<ResolvedElement> {
  const rX = resolved.resolvedX ?? 0;
  const rY = resolved.resolvedY ?? 0;
  const rW = resolved.resolvedWidth ?? 0;
  const rH = resolved.resolvedHeight ?? 0;

  let x = rX;
  let y = rY;

  switch (element.anchor) {
    case 'top-left':
      // Already correct — anchored to top-left by default
      break;

    case 'top-center':
      x = (surface.width - rW) / 2;
      break;

    case 'top-right':
      x = surface.width - rW - (surface.width - rX - rW);
      // Maintain distance from right edge
      x = surface.width - rW - ((surface.width * (100 - element.x - element.width)) / 100);
      break;

    case 'center-left':
      y = (surface.height - rH) / 2;
      break;

    case 'center':
      x = (surface.width - rW) / 2;
      y = (surface.height - rH) / 2;
      break;

    case 'center-right':
      x = surface.width - rW - ((surface.width * (100 - element.x - element.width)) / 100);
      y = (surface.height - rH) / 2;
      break;

    case 'bottom-left':
      y = surface.height - rH - ((surface.height * (100 - element.y - element.height)) / 100);
      break;

    case 'bottom-center':
      x = (surface.width - rW) / 2;
      y = surface.height - rH - ((surface.height * (100 - element.y - element.height)) / 100);
      break;

    case 'bottom-right':
      x = surface.width - rW - ((surface.width * (100 - element.x - element.width)) / 100);
      y = surface.height - rH - ((surface.height * (100 - element.y - element.height)) / 100);
      break;
  }

  // Clamp to surface bounds
  x = Math.max(0, Math.min(x, surface.width - rW));
  y = Math.max(0, Math.min(y, surface.height - rH));

  return {
    ...resolved,
    resolvedX: x,
    resolvedY: y,
  };
}

/**
 * Computes effective font size, line height, and required container height
 * to guarantee that text never clips (accounting for line-height and descenders)
 * and auto-scales down for tight surfaces like Leaderboard (90px).
 */
export function computeTextMetrics(
  element: ElementNode,
  surface: Surface,
  baseWidth: number,
  baseHeight: number
): {
  effectiveFontSize: number;
  effectiveLineHeight: number;
  requiredHeight: number;
} {
  const props = element.props as { fontSize?: number; lineHeight?: number; content?: string };
  const baseFontSize = props.fontSize || 24;
  let fontSize = baseFontSize;

  // 1. Height constraint: For very tight surfaces (height <= 120px, e.g. Leaderboard 90px),
  // auto-scale font size down so it fits comfortably with full descender clearance.
  if (surface.height <= 100) {
    const maxHeadline = Math.max(14, Math.floor(surface.height * 0.20)); // ~18px for 90px
    const maxSubtext = Math.max(10, Math.floor(surface.height * 0.13)); // ~11px for 90px
    const maxAllowed = baseFontSize > 18 ? maxHeadline : maxSubtext;
    fontSize = Math.min(fontSize, maxAllowed);
  } else if (surface.height <= 260) {
    // For 250px Banner height: limit large headlines so they don't dominate and overlap
    if (baseFontSize > 22) {
      fontSize = Math.min(fontSize, Math.max(18, Math.floor(surface.height * 0.088))); // ~22px
    }
  } else if (surface.width >= 720 && surface.height >= 720) {
    // High-resolution canvases (e.g. 1080x1920 Story, 1080x1080 Square):
    // Proportionally scale typography to native canvas resolution (2.2x - 2.5x)
    // so text has appropriate visual weight and remains clearly legible on mobile screens.
    const resMultiplier = Math.min(2.4, Math.max(1.8, surface.width / 440));
    fontSize = Math.round(baseFontSize * resMultiplier);
  } else if (surface.width <= 360 && baseFontSize > 20) {
    fontSize = Math.min(fontSize, Math.max(17, Math.floor(surface.width * 0.063))); // ~19px
  }

  fontSize = Math.round(fontSize);

  // 3. Line height in pixels: accounts for font line-height ratio
  const lineMultiplier = props.lineHeight && props.lineHeight > 0 ? props.lineHeight : 1.25;
  const effectiveLineHeight = Math.ceil(fontSize * lineMultiplier);

  // 4. Estimate rendered line count
  const content = props.content || '';
  const avgCharWidth = fontSize * 0.52;
  const estimatedTextWidth = content.length * avgCharWidth;
  const textPaddingH = 8;
  const usableWidth = Math.max(baseWidth - textPaddingH, 40);
  const lines = Math.max(1, Math.ceil(estimatedTextWidth / usableWidth));

  // 5. Container height: MUST account for full rendered line-height of all lines,
  // PLUS generous vertical padding (at least 6-8px) so ascenders and descenders (g, j, p, q, y) never clip!
  const verticalPadding = Math.max(6, Math.ceil(fontSize * 0.35));
  const requiredHeight = (lines * effectiveLineHeight) + verticalPadding;

  return {
    effectiveFontSize: fontSize,
    effectiveLineHeight,
    requiredHeight: Math.max(baseHeight, requiredHeight),
  };
}

/**
 * Resolves a single element node for a given surface.
 * Applies scaling strategy + anchor constraint.
 */
function resolveElement(
  element: ElementNode,
  surface: Surface,
  reflowYOffset: number
): ResolvedElement {
  // Skip invisible elements
  if (!element.visible) {
    return {
      ...element,
      resolvedX: 0,
      resolvedY: 0,
      resolvedWidth: 0,
      resolvedHeight: 0,
      hidden: true,
      reflowed: false,
    };
  }

  // Step 1: Apply scaling strategy (computes base resolved dimensions)
  let resolved = applyScalingStrategy(element, surface, reflowYOffset);

  let effectiveFontSize: number | undefined;
  let effectiveLineHeight: number | undefined;

  // Step 2: For text elements, ensure container height accounts for line-height and descenders
  if (element.type === 'text' && element.props) {
    const textMetrics = computeTextMetrics(
      element,
      surface,
      resolved.resolvedWidth ?? (element.width / 100) * surface.width,
      resolved.resolvedHeight ?? (element.height / 100) * surface.height
    );
    resolved.resolvedHeight = textMetrics.requiredHeight;
    effectiveFontSize = textMetrics.effectiveFontSize;
    effectiveLineHeight = textMetrics.effectiveLineHeight;
  }

  // Step 2b: For button elements, ensure container height and width accommodate font and padding
  if (element.type === 'button') {
    const isTight = surface.height <= 100;
    let minBtnHeight = isTight ? 26 : Math.max(34, Math.floor(surface.height * 0.05));
    if (surface.width >= 720 && surface.height >= 720) {
      // High-res mobile surfaces: button height scales to 80-96px
      minBtnHeight = Math.max(76, Math.min(96, Math.floor(surface.height * 0.046)));
    }
    resolved.resolvedHeight = Math.max(resolved.resolvedHeight ?? 0, minBtnHeight);

    // On narrow surfaces (e.g. Skyscraper 160px), expand button width and center it
    if (surface.width <= 220) {
      const minBtnWidth = Math.min(surface.width - 16, 142);
      resolved.resolvedWidth = Math.max(resolved.resolvedWidth ?? 0, minBtnWidth);
      resolved.resolvedX = Math.round((surface.width - resolved.resolvedWidth) / 2);
    }
  }

  // Step 3: Apply anchor constraint (adjusts position based on anchor point)
  // Skip anchor adjustment for reflowed elements (they use stacked layout)
  if (!resolved.reflowed) {
    resolved = applyAnchorConstraint(element, resolved, surface);
  }

  return {
    ...element,
    resolvedX: resolved.resolvedX ?? 0,
    resolvedY: resolved.resolvedY ?? 0,
    resolvedWidth: resolved.resolvedWidth ?? 0,
    resolvedHeight: resolved.resolvedHeight ?? 0,
    hidden: resolved.hidden ?? false,
    reflowed: resolved.reflowed ?? false,
    effectiveFontSize,
    effectiveLineHeight,
  };
}

/**
 * Main entry point: resolves an entire layout schema for a target surface.
 *
 * @param schema - The layout schema with elements and constraints
 * @param surface - The target surface dimensions
 * @returns A RenderTree with resolved absolute pixel positions
 */
export function resolveLayout(
  schema: LayoutSchema,
  surface: Surface
): RenderTree {
  const warnings: string[] = [];

  // Sort elements by priority (lower = more important) for reflow ordering
  const sortedElements = [...schema.elements].sort(
    (a, b) => a.priority - b.priority
  );

  let reflowYOffset = surface.height * 0.05; // Initial 5% top padding for reflow
  const resolvedElements: ResolvedElement[] = [];

  for (const element of sortedElements) {
    const resolved = resolveElement(element, surface, reflowYOffset);
    resolvedElements.push(resolved);

    // Track reflow offset for next element
    if (resolved.reflowed && !resolved.hidden) {
      reflowYOffset = resolved.resolvedY + resolved.resolvedHeight + surface.height * 0.02;
    }

    // Generate warnings
    if (resolved.hidden) {
      warnings.push(
        `Element "${element.label}" (${element.id}) hidden on ${surface.name} — surface too small`
      );
    }

    if (resolved.reflowed) {
      warnings.push(
        `Element "${element.label}" (${element.id}) reflowed on ${surface.name}`
      );
    }

    // Warn if element extends beyond surface
    if (
      !resolved.hidden &&
      (resolved.resolvedX + resolved.resolvedWidth > surface.width + 1 ||
        resolved.resolvedY + resolved.resolvedHeight > surface.height + 1)
    ) {
      warnings.push(
        `Element "${element.label}" (${element.id}) overflows ${surface.name} bounds`
      );
    }
  }

  // On very short surfaces (height <= 100, e.g. 728x90 Leaderboard):
  // Hide secondary text elements (priority > 1) to guarantee zero crowding/clipping between headline and CTA
  if (surface.height <= 100) {
    for (const el of resolvedElements) {
      if (el.type === 'text' && el.priority > 1) {
        el.hidden = true;
      }
    }
  }

  // Avoid overlapping elements (especially text elements on tight/narrow surfaces like Banner & Leaderboard)
  const visibleElements = [...resolvedElements]
    .filter((e) => !e.hidden)
    .sort((a, b) => a.y - b.y);

  for (let i = 0; i < visibleElements.length - 1; i++) {
    const current = visibleElements[i];
    const next = visibleElements[i + 1];

    if (next.y >= current.y) {
      const currentRight = current.resolvedX + current.resolvedWidth;
      const nextRight = next.resolvedX + next.resolvedWidth;
      const xOverlap = Math.min(currentRight, nextRight) - Math.max(current.resolvedX, next.resolvedX);

      // If they overlap horizontally
      if (xOverlap > Math.min(current.resolvedWidth, next.resolvedWidth) * 0.25) {
        const currentBottom = current.resolvedY + current.resolvedHeight;
        const minGap = surface.height <= 120 ? 4 : Math.max(6, Math.floor(surface.height * 0.025));

        if (next.resolvedY < currentBottom + minGap) {
          const shift = (currentBottom + minGap) - next.resolvedY;
          if (next.resolvedY + shift + next.resolvedHeight <= surface.height) {
            next.resolvedY += shift;
          } else if (surface.height <= 100) {
            if (next.type === 'text' && next.priority >= 2) {
              // Hide secondary text that cannot fit vertically in 90px
              next.hidden = true;
            } else if (next.type === 'button') {
              // Vertically balance headline and button symmetrically in 90px
              next.resolvedY = surface.height - next.resolvedHeight - 8;
              current.resolvedY = Math.max(4, next.resolvedY - current.resolvedHeight - minGap);
            }
          }
        }
      }
    }
  }

  // Re-sort by zIndex for proper layering in the render tree
  resolvedElements.sort((a, b) => a.zIndex - b.zIndex);

  return {
    surface,
    elements: resolvedElements,
    warnings,
  };
}
