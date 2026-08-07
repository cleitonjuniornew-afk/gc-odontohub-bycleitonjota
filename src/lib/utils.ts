import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionalmente e resolve conflitos do Tailwind.
 * Utilizado por todos os componentes do Design System.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
