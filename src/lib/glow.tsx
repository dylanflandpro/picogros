import { LinearGradient } from 'expo-linear-gradient';
import type { StyleProp, ViewStyle } from 'react-native';

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Halo lumineux d'ambiance à poser en absolu derrière le contenu. */
export function Glow({
  color,
  size,
  opacity = 0.3,
  style,
}: {
  color: string;
  size: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={[withAlpha(color, opacity), withAlpha(color, 0)]}
      start={{ x: 0.5, y: 0.1 }}
      end={{ x: 0.5, y: 0.9 }}
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}
