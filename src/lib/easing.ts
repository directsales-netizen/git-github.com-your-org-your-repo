/**
 * Named easing curves shared by Framer Motion and GSAP call sites.
 * Framer Motion accepts cubic-bezier arrays directly; GSAP accepts its own
 * ease-string syntax — kept as parallel exports so each library gets its
 * native format instead of a lossy conversion at every call site.
 */

// Framer Motion (cubic-bezier arrays)
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeInOut: [number, number, number, number] = [0.65, 0, 0.35, 1];
export const easeEmphasized: [number, number, number, number] = [0.2, 0, 0, 1];

// GSAP (ease-string syntax)
export const gsapEaseOut = 'power3.out';
export const gsapEaseInOut = 'power2.inOut';
export const gsapEaseEmphasized = 'expo.out';
