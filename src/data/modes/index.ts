import type { GameMode } from '../types';
import { bar } from './bar';
import { before } from './before';
import { caliente } from './caliente';
import { debiles } from './debiles';
import { guerre } from './guerre';

export const MODES: GameMode[] = [before, debiles, bar, caliente, guerre];

export function getMode(id: string): GameMode | undefined {
  return MODES.find((m) => m.id === id);
}
