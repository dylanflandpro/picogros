export type CardKind =
  | 'action' // défi ou action simple
  | 'question' // question posée à un joueur
  | 'game' // mini-jeu de groupe
  | 'virus' // règle temporaire avec carte de fin injectée plus tard
  | 'vote' // tout le monde vote / pointe quelqu'un du doigt
  | 'duel' // affrontement entre deux joueurs
  | 'jamais' // jamais je n'ai...
  | 'rule' // règle valable toute la partie
  | 'team'; // carte d'équipe (mode guerre)

export interface Card {
  kind: CardKind;
  /**
   * Texte de la carte. Placeholders disponibles :
   * {p1}, {p2}, {p3} — joueurs aléatoires distincts
   * {teamA}, {teamB} — noms des équipes (mode guerre)
   * {sips} — nombre de gorgées aléatoire (fourchette selon l'intensité)
   */
  text: string;
  /**
   * Niveau d'intensité : 1 = soft, 2 = normal (défaut), 3 = hard.
   * Filtre le deck selon le réglage de la partie et ordonne le mode crescendo.
   */
  intensity?: 1 | 2 | 3;
  /** Texte de la carte de fin pour les virus, injectée quelques cartes plus tard. */
  followUp?: string;
  /** Fourchette [min, max] de cartes avant l'apparition du followUp. Défaut : [6, 12]. */
  followUpDelay?: [number, number];
}

export interface ModeColors {
  /** Dégradé de fond de l'écran de jeu et de la vignette du mode. */
  gradient: readonly [string, string];
  /** Couleur d'accent (boutons, highlights). */
  accent: string;
  /** Couleur du texte sur le dégradé. */
  text: string;
}

export interface GameMode {
  id: string;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  colors: ModeColors;
  minPlayers: number;
  /** true si le contenu est réservé à un public averti (affiche un badge 18+). */
  spicy?: boolean;
  cards: Card[];
}
