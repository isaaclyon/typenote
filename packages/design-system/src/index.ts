/**
 * TypeNote Design System
 *
 * Foundation layer with design tokens and utilities.
 * Components are organized as primitives (atoms) and patterns (molecules).
 */

// Utilities
export { cn } from './lib/utils.js';

// Primitives (atoms) - foundational UI elements
export * from './primitives/index.js';

// Patterns (molecules) - composed UI elements
export * from './patterns/index.js';

// Legacy: components/ re-exports primitives + patterns for backward compatibility
// Import directly from primitives/ or patterns/ for new code
