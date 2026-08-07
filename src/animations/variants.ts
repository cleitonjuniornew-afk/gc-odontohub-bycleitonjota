import type { Variants, Transition } from "framer-motion";

/**
 * Biblioteca central de animações do GC OdontoHub.
 * Regra do Design System: toda animação entre 120ms e 250ms, nunca exagerada.
 * Nunca duplicar variantes de animação em componentes — sempre importar daqui.
 */

export const TRANSITION_FAST: Transition = { duration: 0.12, ease: "easeOut" };
export const TRANSITION_BASE: Transition = { duration: 0.18, ease: "easeOut" };
export const TRANSITION_SLOW: Transition = { duration: 0.25, ease: "easeOut" };

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION_BASE },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: TRANSITION_BASE },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: TRANSITION_BASE },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: TRANSITION_BASE },
  exit: { opacity: 0, x: 24, transition: TRANSITION_FAST },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: TRANSITION_BASE },
  exit: { opacity: 0, x: -24, transition: TRANSITION_FAST },
};

/** Stagger para listas de cards (dashboard, grids, etc.) */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/** Modo Atendimento: transição de entrada em <500ms conforme especificação */
export const clinicalModeTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};
