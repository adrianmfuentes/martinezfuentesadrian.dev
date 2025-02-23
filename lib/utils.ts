// lib/utils.ts

// Función que combina clases de CSS, ignorando valores falsy.
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
  }
  