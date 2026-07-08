import { Platform } from 'react-native';

/**
 * Les animations d'entrée de Reanimated ne se déclenchent pas toujours sur le
 * web (l'élément reste alors bloqué en opacité 0 → écran vide). On les
 * désactive hors natif : le contenu s'affiche directement.
 */
export function enterAnim<T>(animation: T): T | undefined {
  return Platform.OS === 'web' ? undefined : animation;
}
