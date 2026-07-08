import { create } from 'zustand';
import type { Card, GameMode } from '@/data/types';

export interface DrawnCard {
  kind: Card['kind'];
  text: string;
  /** true si c'est la carte de fin d'un virus. */
  isFollowUp?: boolean;
}

export type Intensity = 'soft' | 'normal' | 'hard';

interface GameState {
  players: string[];
  teamA: string[];
  teamB: string[];
  mode: GameMode | null;
  deck: DrawnCard[];
  index: number;
  /** Réglages de la partie (choisis sur l'écran des modes). */
  intensity: Intensity;
  crescendo: boolean;

  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  setIntensity: (intensity: Intensity) => void;
  setCrescendo: (crescendo: boolean) => void;
  startGame: (mode: GameMode) => void;
  nextCard: () => void;
  prevCard: () => void;
  endGame: () => void;
}

const GAME_LENGTH = 45;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

function teamLabel(which: 'A' | 'B'): string {
  return which === 'A' ? 'Équipe Rouge 🔴' : 'Équipe Bleue 🔵';
}

/** Nombre de joueurs distincts requis par les placeholders {p1}..{p3}. */
function playersNeeded(text: string): number {
  if (text.includes('{p3}')) return 3;
  if (text.includes('{p2}')) return 2;
  if (text.includes('{p1}')) return 1;
  return 0;
}

/** Fourchette de gorgées {sips} selon l'intensité de la partie. */
const SIPS_RANGE: Record<Intensity, [number, number]> = {
  soft: [1, 3],
  normal: [2, 5],
  hard: [3, 6],
};

const cardLevel = (card: Card) => card.intensity ?? 2;

/**
 * Cartes éligibles selon le réglage d'intensité :
 * soft exclut les cartes hard, hard exclut les cartes soft.
 */
function filterByIntensity(cards: Card[], intensity: Intensity): Card[] {
  if (intensity === 'soft') return cards.filter((c) => cardLevel(c) <= 2);
  if (intensity === 'hard') return cards.filter((c) => cardLevel(c) >= 2);
  return cards;
}

/**
 * Construit une partie : sélectionne GAME_LENGTH cartes mélangées
 * (filtrées par intensité, triées par niveau si crescendo),
 * remplit les placeholders, puis insère chaque carte de fin de virus
 * quelques positions après sa carte d'origine (mêmes joueurs tirés).
 */
export function buildDeck(
  mode: GameMode,
  players: string[],
  intensity: Intensity,
  crescendo: boolean,
): DrawnCard[] {
  const pool = filterByIntensity(mode.cards, intensity);
  const source = pick(pool, Math.min(GAME_LENGTH, pool.length));
  if (crescendo) {
    // Tri stable sur un ordre déjà mélangé : l'aléatoire est conservé
    // à l'intérieur de chaque palier d'intensité.
    source.sort((a, b) => cardLevel(a) - cardLevel(b));
  }
  const deck: DrawnCard[] = [];
  const followUps: { at: number; card: DrawnCard }[] = [];
  const [minSips, maxSips] = SIPS_RANGE[intensity];

  for (const card of source) {
    const count = playersNeeded(card.text + (card.followUp ?? ''));
    const chosen = pick(players, count);

    const fill = (raw: string): string => {
      let out = raw;
      chosen.forEach((name, i) => {
        out = out.split(`{p${i + 1}}`).join(name);
      });
      out = out.split('{teamA}').join(teamLabel('A'));
      out = out.split('{teamB}').join(teamLabel('B'));
      while (out.includes('{sips}')) {
        out = out.replace('{sips}', String(randInt(minSips, maxSips)));
      }
      return out;
    };

    deck.push({ kind: card.kind, text: fill(card.text) });

    if (card.followUp) {
      const [min, max] = card.followUpDelay ?? [6, 12];
      followUps.push({
        at: deck.length + randInt(min, max),
        card: { kind: card.kind, text: fill(card.followUp), isFollowUp: true },
      });
    }
  }

  // Insertion par position croissante : chaque insertion décale les suivantes.
  followUps.sort((x, y) => x.at - y.at);
  followUps.forEach((f, i) => {
    deck.splice(Math.min(f.at + i, deck.length), 0, f.card);
  });

  return deck;
}

export const useGame = create<GameState>((set, get) => ({
  players: [],
  teamA: [],
  teamB: [],
  mode: null,
  deck: [],
  index: 0,
  intensity: 'normal',
  crescendo: false,

  addPlayer: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { players } = get();
    if (players.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;
    set({ players: [...players, trimmed] });
  },

  removePlayer: (name) =>
    set((s) => ({ players: s.players.filter((p) => p !== name) })),

  setIntensity: (intensity) => set({ intensity }),
  setCrescendo: (crescendo) => set({ crescendo }),

  startGame: (mode) => {
    const { players, intensity, crescendo } = get();
    let teamA: string[] = [];
    let teamB: string[] = [];
    const deck = buildDeck(mode, players, intensity, crescendo);
    if (mode.id === 'guerre') {
      const mixed = shuffle(players);
      teamA = mixed.slice(0, Math.ceil(mixed.length / 2));
      teamB = mixed.slice(Math.ceil(mixed.length / 2));
      deck.unshift({
        kind: 'team',
        text: `Les équipes sont formées !\n\n🔴 Équipe Rouge : ${teamA.join(', ')}\n\n🔵 Équipe Bleue : ${teamB.join(', ')}\n\nQue la guerre commence.`,
      });
    }
    set({ mode, deck, index: 0, teamA, teamB });
  },

  nextCard: () => set((s) => ({ index: Math.min(s.index + 1, s.deck.length) })),
  prevCard: () => set((s) => ({ index: Math.max(s.index - 1, 0) })),
  endGame: () => set({ mode: null, deck: [], index: 0, teamA: [], teamB: [] }),
}));
