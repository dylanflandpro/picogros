/**
 * Palette « Cocktail de minuit » : nuit violette profonde éclairée par des
 * lueurs chaudes mangue → framboise. Les écrans app piochent ici ; les écrans
 * de jeu restent pilotés par ModeColors.
 */
export const theme = {
  /** Dégradé de fond des écrans app (haut → bas). */
  night: ['#2C1B52', '#170E33', '#0C071D'] as const,
  /** Fond de base (racine, shell web, transitions). */
  bg: '#0C071D',
  /** Accent principal (mangue). */
  accent: '#FFA94D',
  /** Accent secondaire (framboise), pour les dégradés de CTA. */
  accentAlt: '#FF5E7E',
  /** Dégradé signature des boutons principaux. */
  cta: ['#FFB45C', '#FF5E7E'] as const,
  /** Texte foncé posé sur un fond accent. */
  onAccent: '#331036',
  /** Surface verre dépoli. */
  surface: 'rgba(255,255,255,0.07)',
  surfaceBorder: 'rgba(255,255,255,0.12)',
  /** Creux sombres (inputs, pistes de contrôles). */
  inset: 'rgba(0,0,0,0.28)',
  white: '#FFFFFF',
  text75: 'rgba(255,255,255,0.75)',
  text60: 'rgba(255,255,255,0.6)',
  text45: 'rgba(255,255,255,0.45)',
  text35: 'rgba(255,255,255,0.35)',
} as const;
