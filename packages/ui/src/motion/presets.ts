export const FADE_TRANSITION = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

export const SLIDE_UP = {
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: 24  },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const SCALE_IN = {
  initial:    { opacity: 0, scale: 0.95 },
  animate:    { opacity: 1, scale: 1    },
  exit:       { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const GRID_STAGGER_PRESET = {
  animate: { transition: { staggerChildren: 0.05 } },
};
