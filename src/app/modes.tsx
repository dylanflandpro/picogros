import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MODES } from '@/data/modes';
import { enterAnim } from '@/lib/animations';
import { Glow } from '@/lib/glow';
import { theme } from '@/lib/theme';
import type { GameMode } from '@/data/types';
import { useGame, type Intensity } from '@/store/game';

const INTENSITIES: { value: Intensity; label: string; emoji: string }[] = [
  { value: 'soft', label: 'Soft', emoji: '🍃' },
  { value: 'normal', label: 'Normal', emoji: '🍺' },
  { value: 'hard', label: 'Hard', emoji: '🌶️' },
];

export default function ModesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { players, startGame, intensity, setIntensity, crescendo, setCrescendo } = useGame();

  const launch = (mode: GameMode) => {
    if (players.length < mode.minPlayers) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGame(mode);
    router.push('/game');
  };

  return (
    <LinearGradient colors={theme.night} style={styles.flex}>
      <Glow color={theme.accent} size={380} style={styles.glowTop} />

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
      >
        <Text style={styles.heading}>Choisis ton ambiance</Text>
        <Text style={styles.subheading}>Chaque mode a son propre délire.</Text>

        <Animated.View
          entering={enterAnim(FadeInDown.springify().damping(16))}
          style={styles.settings}
        >
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Intensité</Text>
            <View style={styles.segmented}>
              {INTENSITIES.map((opt) => {
                const active = intensity === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIntensity(opt.value);
                    }}
                    style={[styles.segment, active && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {opt.emoji} {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCrescendo(!crescendo);
            }}
            style={styles.settingRow}
          >
            <View style={styles.crescendoTexts}>
              <Text style={styles.settingLabel}>📈 Crescendo</Text>
              <Text style={styles.settingHint}>L’intensité monte au fil de la partie</Text>
            </View>
            <View style={[styles.toggle, crescendo && styles.toggleOn]}>
              <View style={[styles.toggleKnob, crescendo && styles.toggleKnobOn]} />
            </View>
          </Pressable>
        </Animated.View>

        {MODES.map((mode, i) => {
          const locked = players.length < mode.minPlayers;
          return (
            <Animated.View
              key={mode.id}
              entering={enterAnim(FadeInDown.springify().damping(16).delay(i * 70))}
            >
              <Pressable
                onPress={() => launch(mode)}
                disabled={locked}
                style={({ pressed }) => [
                  !locked && [styles.modeGlow, { shadowColor: mode.colors.accent }],
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={mode.colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.modeCard, locked && styles.locked]}
                >
                  <View
                    style={[
                      styles.emojiTile,
                      { backgroundColor: mode.colors.accent, shadowColor: mode.colors.accent },
                    ]}
                  >
                    <Text style={styles.emoji}>{mode.emoji}</Text>
                  </View>
                  <View style={styles.modeTexts}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.modeTitle, { color: mode.colors.text }]}>
                        {mode.title}
                      </Text>
                      {mode.spicy && (
                        <View style={styles.badge}>
                          <Text style={[styles.badgeText, { color: mode.colors.accent }]}>
                            18+
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.modeTagline, { color: mode.colors.accent }]}>
                      {mode.tagline}
                    </Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                    {locked && (
                      <Text style={styles.lockedText}>🔒 {mode.minPlayers} joueurs minimum</Text>
                    )}
                  </View>
                  {!locked && <Text style={styles.chevron}>›</Text>}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.footerText}>
          {players.length} joueur{players.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.footerSpacer} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  glowTop: { top: -140, right: -140 },
  list: { paddingHorizontal: 20, gap: 14 },
  heading: {
    color: theme.white,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  subheading: {
    color: theme.text60,
    fontSize: 15,
    marginBottom: 10,
  },
  settings: {
    backgroundColor: theme.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
    padding: 16,
    gap: 16,
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingLabel: { color: theme.white, fontSize: 15, fontWeight: '800' },
  settingHint: { color: theme.text45, fontSize: 12, marginTop: 2 },
  crescendoTexts: { flex: 1 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.inset,
    borderRadius: 13,
    padding: 3,
    gap: 3,
  },
  segment: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  segmentText: { color: theme.text60, fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: theme.onAccent, fontWeight: '800' },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.inset,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: theme.accent },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  toggleKnobOn: { alignSelf: 'flex-end', backgroundColor: theme.onAccent },
  modeGlow: {
    borderRadius: 26,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  locked: { opacity: 0.45 },
  emojiTile: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  emoji: { fontSize: 34 },
  modeTexts: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeTitle: { fontSize: 22, fontWeight: '900' },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  modeTagline: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modeDescription: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  chevron: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 30,
    fontWeight: '300',
    marginLeft: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(12,7,29,0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: theme.white, fontSize: 20, fontWeight: '700' },
  footerText: { color: theme.white, fontSize: 16, fontWeight: '800' },
  footerSpacer: { width: 44 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
