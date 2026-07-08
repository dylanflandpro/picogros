import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import type { CardKind } from '@/data/types';
import { enterAnim } from '@/lib/animations';
import { useGame } from '@/store/game';

const KIND_LABELS: Record<CardKind, string> = {
  action: '⚡ Action',
  question: '💬 Question',
  game: '🎲 Mini-jeu',
  virus: '🦠 Virus',
  vote: '👉 Vote',
  duel: '🥊 Duel',
  jamais: '🙊 Jamais je n’ai...',
  rule: '📜 Nouvelle règle',
  team: '⚔️ Guerre',
};

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, deck, index, nextCard, prevCard, startGame, endGame, intensity, crescendo } =
    useGame();

  if (!mode) return null;

  const settingsBadge = [
    intensity === 'soft' ? '🍃' : intensity === 'hard' ? '🌶️' : null,
    crescendo ? '📈' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const finished = index >= deck.length;
  const card = finished ? null : deck[index];
  const progress = deck.length ? Math.min(index / deck.length, 1) : 0;

  const quit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    endGame();
    router.back();
  };

  const advance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextCard();
  };

  const rewind = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    prevCard();
  };

  return (
    <LinearGradient
      colors={mode.colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 1 }}
      style={styles.flex}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={quit} style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={[styles.modeName, { color: mode.colors.text }]}>
          {mode.emoji} {mode.title}
        </Text>
        {settingsBadge !== '' && (
          <View style={styles.settingsBadge}>
            <Text style={styles.settingsBadgeText}>{settingsBadge}</Text>
          </View>
        )}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: mode.colors.accent },
            ]}
          />
        </View>
      </View>

      {finished ? (
        <View style={styles.cardZone}>
          <Animated.View entering={enterAnim(ZoomIn.duration(400))} style={styles.endBox}>
            <Text style={styles.endEmoji}>🏁</Text>
            <Text style={[styles.endTitle, { color: mode.colors.text }]}>C’est terminé !</Text>
            <Text style={styles.endSubtitle}>
              Bravo (ou pas). Buvez une dernière gorgée pour la route.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startGame(mode);
              }}
              style={({ pressed }) => [
                styles.endBtn,
                { backgroundColor: mode.colors.accent },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.endBtnText}>Rejouer ce mode</Text>
            </Pressable>
            <Pressable
              onPress={quit}
              style={({ pressed }) => [styles.endBtnGhost, pressed && styles.pressed]}
            >
              <Text style={styles.endBtnGhostText}>Changer de mode</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <Pressable style={styles.cardZone} onPress={advance}>
          <Animated.View key={index} entering={enterAnim(FadeInDown.duration(300))} style={styles.cardContent}>
            <View
              style={[
                styles.kindPill,
                { backgroundColor: card?.isFollowUp ? 'rgba(0,0,0,0.35)' : mode.colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.kindPillText,
                  card?.isFollowUp && { color: mode.colors.accent },
                ]}
              >
                {card?.isFollowUp ? '🦠 Fin du virus' : KIND_LABELS[card!.kind]}
              </Text>
            </View>
            <Text style={[styles.cardText, { color: mode.colors.text }]}>{card!.text}</Text>
          </Animated.View>

          <Animated.Text entering={enterAnim(FadeIn.delay(600))} style={styles.tapHint}>
            Touche l’écran pour continuer
          </Animated.Text>
        </Pressable>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          onPress={rewind}
          disabled={index === 0}
          style={({ pressed }) => [
            styles.navBtn,
            index === 0 && styles.navBtnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.navBtnText}>←</Text>
        </Pressable>
        <Text style={styles.counter}>
          {Math.min(index + 1, deck.length)} / {deck.length}
        </Text>
        <Pressable
          onPress={advance}
          disabled={finished}
          style={({ pressed }) => [
            styles.navBtn,
            finished && styles.navBtnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.navBtnText}>→</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modeName: { fontSize: 16, fontWeight: '800' },
  settingsBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  settingsBadgeText: { fontSize: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  cardZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  cardContent: { alignItems: 'center', gap: 24 },
  kindPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  kindPillText: { color: '#1C1C28', fontSize: 14, fontWeight: '800' },
  cardText: {
    fontSize: 26,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: 18,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  counter: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '700' },
  endBox: { alignItems: 'center', gap: 12, width: '100%' },
  endEmoji: { fontSize: 60 },
  endTitle: { fontSize: 32, fontWeight: '900' },
  endSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  endBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  endBtnText: { color: '#1C1C28', fontSize: 16, fontWeight: '800' },
  endBtnGhost: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  endBtnGhostText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});
