// ============================================================
// AdaptFlow Layout Engine — Schema Validator
// Framework-agnostic. No React imports allowed in this file.
//
// Validates a LayoutSchema before it reaches the renderer or
// is persisted to the backend. The same validation rules are
// mirrored server-side in LayoutValidationService.java.
// ============================================================

import type {
  LayoutSchema,
  ElementNode,
  ValidationResult,
  ValidationError,
} from './types';

const VALID_ELEMENT_TYPES = ['text', 'image', 'button', 'logo', 'shape'];
const VALID_SCALING_STRATEGIES = ['fit', 'fill', 'reflow', 'hide'];
const VALID_ANCHORS = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

/**
 * Validates a single element node.
 */
function validateElement(element: ElementNode, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const eid = element.id || `element[${index}]`;

  // Required fields
  if (!element.id || typeof element.id !== 'string') {
    errors.push({
      elementId: eid,
      field: 'id',
      message: 'Element must have a non-empty string id',
      severity: 'error',
    });
  }

  if (!element.type || !VALID_ELEMENT_TYPES.includes(element.type)) {
    errors.push({
      elementId: eid,
      field: 'type',
      message: `Element type must be one of: ${VALID_ELEMENT_TYPES.join(', ')}`,
      severity: 'error',
    });
  }

  if (!element.label || typeof element.label !== 'string') {
    errors.push({
      elementId: eid,
      field: 'label',
      message: 'Element must have a non-empty label',
      severity: 'error',
    });
  }

  // Position validation (0-100 percentage range)
  const positionFields = ['x', 'y', 'width', 'height'] as const;
  for (const field of positionFields) {
    const value = element[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push({
        elementId: eid,
        field,
        message: `${field} must be a valid number`,
        severity: 'error',
      });
    } else if (value < 0 || value > 100) {
      errors.push({
        elementId: eid,
        field,
        message: `${field} must be between 0 and 100 (percentage)`,
        severity: 'warning',
      });
    }
  }

  // Width and height should be positive
  if (typeof element.width === 'number' && element.width <= 0) {
    errors.push({
      elementId: eid,
      field: 'width',
      message: 'Element width must be greater than 0',
      severity: 'error',
    });
  }

  if (typeof element.height === 'number' && element.height <= 0) {
    errors.push({
      elementId: eid,
      field: 'height',
      message: 'Element height must be greater than 0',
      severity: 'error',
    });
  }

  // Anchor validation
  if (!element.anchor || !VALID_ANCHORS.includes(element.anchor)) {
    errors.push({
      elementId: eid,
      field: 'anchor',
      message: `Anchor must be one of: ${VALID_ANCHORS.join(', ')}`,
      severity: 'error',
    });
  }

  // Scaling strategy validation
  if (!element.scalingStrategy || !VALID_SCALING_STRATEGIES.includes(element.scalingStrategy)) {
    errors.push({
      elementId: eid,
      field: 'scalingStrategy',
      message: `Scaling strategy must be one of: ${VALID_SCALING_STRATEGIES.join(', ')}`,
      severity: 'error',
    });
  }

  // Priority validation
  if (typeof element.priority !== 'number' || element.priority < 0) {
    errors.push({
      elementId: eid,
      field: 'priority',
      message: 'Priority must be a non-negative number',
      severity: 'error',
    });
  }

  // Props validation
  if (!element.props || typeof element.props !== 'object') {
    errors.push({
      elementId: eid,
      field: 'props',
      message: 'Element must have a props object',
      severity: 'error',
    });
  }

  // zIndex validation
  if (typeof element.zIndex !== 'number') {
    errors.push({
      elementId: eid,
      field: 'zIndex',
      message: 'zIndex must be a number',
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validates an entire LayoutSchema.
 *
 * @param schema - The layout schema to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateSchema(schema: LayoutSchema): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Schema-level validation
  if (!schema.id || typeof schema.id !== 'string') {
    allErrors.push({
      field: 'id',
      message: 'Schema must have a non-empty string id',
      severity: 'error',
    });
  }

  if (!schema.name || typeof schema.name !== 'string') {
    allErrors.push({
      field: 'name',
      message: 'Schema must have a non-empty name',
      severity: 'error',
    });
  }

  if (!Array.isArray(schema.elements)) {
    allErrors.push({
      field: 'elements',
      message: 'Schema must have an elements array',
      severity: 'error',
    });
    return {
      valid: false,
      errors: allErrors.filter((e) => e.severity === 'error'),
      warnings: allErrors.filter((e) => e.severity === 'warning'),
    };
  }

  if (schema.elements.length === 0) {
    allErrors.push({
      field: 'elements',
      message: 'Schema must have at least one element',
      severity: 'warning',
    });
  }

  // Check for duplicate IDs
  const ids = schema.elements.map((e) => e.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    allErrors.push({
      field: 'elements',
      message: `Duplicate element IDs found: ${[...new Set(duplicates)].join(', ')}`,
      severity: 'error',
    });
  }

  // Validate background color
  if (!schema.backgroundColor || typeof schema.backgroundColor !== 'string') {
    allErrors.push({
      field: 'backgroundColor',
      message: 'Schema must have a backgroundColor',
      severity: 'warning',
    });
  }

  // Version validation
  if (typeof schema.version !== 'number' || schema.version < 1) {
    allErrors.push({
      field: 'version',
      message: 'Schema version must be a positive number',
      severity: 'error',
    });
  }

  // Validate each element
  schema.elements.forEach((element, index) => {
    const elementErrors = validateElement(element, index);
    allErrors.push(...elementErrors);
  });

  return {
    valid: allErrors.filter((e) => e.severity === 'error').length === 0,
    errors: allErrors.filter((e) => e.severity === 'error'),
    warnings: allErrors.filter((e) => e.severity === 'warning'),
  };
}
