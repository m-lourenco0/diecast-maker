export const isCompactViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
