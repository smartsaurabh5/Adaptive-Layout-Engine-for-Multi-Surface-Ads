// ============================================================
// AdaptFlow Layout Engine — Type Definitions
// Framework-agnostic. No React imports allowed in this file.
// ============================================================

/** Supported element types in a layout schema */
export type ElementType = 'text' | 'image' | 'button' | 'logo' | 'shape';

/** Scaling strategies applied when adapting elements to a surface */
export type ScalingStrategy = 'fit' | 'fill' | 'reflow' | 'hide';

/** Anchor points for constraint-based positioning */
export type AnchorPoint =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Surface type categories */
export type SurfaceType = 'banner' | 'leaderboard' | 'square' | 'story' | 'skyscraper' | 'custom';

// ---- Element-specific property interfaces ----

export interface TextProps {
  content: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ImageProps {
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius: number;
  opacity: number;
}

export interface ButtonProps {
  label: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  icon?: string;
}

export interface LogoProps {
  src: string;
  alt: string;
  objectFit: 'contain' | 'cover';
  opacity: number;
}

export interface ShapeProps {
  shapeType: 'rectangle' | 'circle' | 'pill' | 'line';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  opacity: number;
}

/** Union of all element-specific props */
export type ElementProps = TextProps | ImageProps | ButtonProps | LogoProps | ShapeProps;

// ---- Core schema types ----

/**
 * An element in the layout schema.
 * Position values (x, y, width, height) are percentages (0-100)
 * relative to the surface — this is what makes the engine adaptive.
 */
export interface ElementNode {
  id: string;
  type: ElementType;
  label: string;
  /** X position as percentage of surface width (0-100) */
  x: number;
  /** Y position as percentage of surface height (0-100) */
  y: number;
  /** Width as percentage of surface width (0-100) */
  width: number;
  /** Height as percentage of surface height (0-100) */
  height: number;
  /** Constraint anchor point — element gravitates toward this corner/edge */
  anchor: AnchorPoint;
  /** How the element adapts when surface dimensions change */
  scalingStrategy: ScalingStrategy;
  /** Minimum width (px) below which element is hidden (used by 'hide' strategy) */
  minWidth?: number;
  /** Priority for reflow/hide decisions. Lower = more important, hidden last */
  priority: number;
  /** Element-specific styling/content properties */
  props: ElementProps;
  /** Z-index for layering */
  zIndex: number;
  /** Whether this element is visible in the current editing state */
  visible: boolean;
  /** Whether this element is locked from editing */
  locked: boolean;
}

/**
 * A target surface (ad placement) with its dimensions.
 */
export interface Surface {
  id: string;
  name: string;
  width: number;
  height: number;
  type: SurfaceType;
  /** Below this width (px), reflow strategy kicks in */
  minSupportedWidth: number;
}

/**
 * The complete layout schema — the JSON document that defines an ad creative.
 */
export interface LayoutSchema {
  id: string;
  name: string;
  elements: ElementNode[];
  backgroundColor: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

// ---- Resolved output types ----

/**
 * An element after the constraint resolver has computed its
 * absolute pixel positions for a specific surface.
 */
export interface ResolvedElement extends ElementNode {
  /** Resolved X position in pixels */
  resolvedX: number;
  /** Resolved Y position in pixels */
  resolvedY: number;
  /** Resolved width in pixels */
  resolvedWidth: number;
  /** Resolved height in pixels */
  resolvedHeight: number;
  /** Whether the element should be hidden on this surface */
  hidden: boolean;
  /** Whether the element was reflowed (position changed from original) */
  reflowed: boolean;
  /** Effective font size in pixels after auto-scaling for tight surfaces */
  effectiveFontSize?: number;
  /** Effective line height in pixels after auto-scaling */
  effectiveLineHeight?: number;
}

/**
 * The final output of the layout engine: a render tree ready
 * for the React renderer to consume.
 */
export interface RenderTree {
  surface: Surface;
  elements: ResolvedElement[];
  warnings: string[];
}

// ---- Validation types ----

export interface ValidationError {
  elementId?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
