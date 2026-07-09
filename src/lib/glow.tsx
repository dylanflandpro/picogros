import { LinearGradient } from 'expo-linear-gradient';
import type { StyleProp, ViewStyle } from 'react-native';

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Voile lumineux d'ambiance, pleine largeur, fondu vers le transparent.
 * Un dégradé linéaire borné par un cercle laisse des arcs durs visibles ;
 * la bande pleine largeur ne montre que le fondu.
 */
export function Glow({
  color,
  height,
  edge,
  opacity = 0.14,
  style,
}: {
  color: string;
  height: number;
  edge: 'top' | 'bottom';
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors: [string, string] =
    edge === 'top'
      ? [withAlpha(color, opacity), withAlpha(color, 0)]
      : [withAlpha(color, 0), withAlpha(color, opacity)];
  return (
    <LinearGradient
      colors={colors}
      pointerEvents="none"
      style={[
        { position: 'absolute', left: 0, right: 0, height },
        edge === 'top' ? { top: 0 } : { bottom: 0 },
        style,
      ]}
    />
  );
}
