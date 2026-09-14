// ============================================================
// AdaptFlow Layout Engine — Public Entrypoint
// Framework-agnostic. No React imports allowed in this file.
//
// This module is the single public API for the layout engine.
// Import this, not the internal modules directly.
// ============================================================

import type {
  LayoutSchema,
  Surface,
  RenderTree,
  ValidationResult,
  SurfaceType,
} from './types';
import { resolveLayout } from './constraintResolver';
import { validateSchema } from './validator';

// Re-export all types for consumers
export type {
  LayoutSchema,
  Surface,
  RenderTree,
  ResolvedElement,
  ElementNode,
  ElementType,
  ScalingStrategy,
  AnchorPoint,
  SurfaceType,
  TextProps,
  ImageProps,
  ButtonProps,
  LogoProps,
  ShapeProps,
  ElementProps,
  ValidationResult,
  ValidationError,
} from './types';

// Re-export core functions
export { resolveLayout } from './constraintResolver';
export { validateSchema } from './validator';
export {
  applyFit,
  applyFill,
  applyReflow,
  applyHide,
  applyScalingStrategy,
} from './scalingStrategies';

/**
 * Default surface catalog.
 * These are the standard ad surface dimensions seeded in the database.
 * The frontend fetches these from /api/surfaces in production, but
 * this catalog provides a fallback and is used in testing.
 */
export const DEFAULT_SURFACES: Surface[] = [
  {
    id: 'surface-banner',
    name: 'Web Banner (Medium Rectangle)',
    width: 300,
    height: 250,
    type: 'banner' as SurfaceType,
    minSupportedWidth: 200,
  },
  {
    id: 'surface-leaderboard',
    name: 'Leaderboard (Web Display)',
    width: 728,
    height: 90,
    type: 'leaderboard' as SurfaceType,
    minSupportedWidth: 468,
  },
  {
    id: 'surface-square',
    name: 'Square (Feed & Instagram Post)',
    width: 1080,
    height: 1080,
    type: 'square' as SurfaceType,
    minSupportedWidth: 400,
  },
  {
    id: 'surface-story',
    name: 'Vertical Story (Reels, TikTok, Stories)',
    width: 1080,
    height: 1920,
    type: 'story' as SurfaceType,
    minSupportedWidth: 360,
  },
  {
    id: 'surface-skyscraper',
    name: 'Skyscraper (Desktop Sidebar)',
    width: 160,
    height: 600,
    type: 'skyscraper' as SurfaceType,
    minSupportedWidth: 120,
  },
];

/**
 * Validates and resolves a layout schema for a target surface.
 * Combines validation and resolution into a single call.
 *
 * @param schema - The layout schema
 * @param surface - The target surface
 * @returns The resolved render tree, or throws if schema is invalid
 */
export function resolveAndValidate(
  schema: LayoutSchema,
  surface: Surface
): { renderTree: RenderTree; validation: ValidationResult } {
  const validation = validateSchema(schema);
  const renderTree = resolveLayout(schema, surface);

  // Merge validation warnings with render-time warnings
  const allWarnings = [
    ...validation.warnings.map((w) => w.message),
    ...renderTree.warnings,
  ];

  return {
    renderTree: { ...renderTree, warnings: allWarnings },
    validation,
  };
}

/**
 * Creates a blank layout schema with sensible defaults.
 */
export function createBlankSchema(name: string = 'Untitled Layout'): LayoutSchema {
  return {
    id: `layout-${Date.now()}`,
    name,
    elements: [],
    backgroundColor: '#ffffff',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Returns the default surface catalog.
 * In production, surfaces should be fetched from the API.
 */
export function getSupportedSurfaces(): Surface[] {
  return [...DEFAULT_SURFACES];
}
