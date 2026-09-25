import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import type { CardKind } from '@/data/types';
import { enterAnim } from '@/lib/animations';
import { useGame, type Level } from '@/store/game';

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
  const { mode, deck, index, nextCard, prevCard, startGame, endGame, intensity, crescendo, level } =
    useGame();

  if (!mode) return null;

  const settingsBadge =
    level && mode.levels
      ? `Niv. ${level} · ${mode.levels[level - 1]}`
      : [intensity === 'soft' ? '🍃' : intensity === 'hard' ? '🌶️' : null, crescendo ? '📈' : null]
          .filter(Boolean)
          .join(' ');
  const nextLevel = level && level < 3 && mode.levels ? ((level + 1) as Level) : null;

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
        <Pressable
          onPress={quit}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        >
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
              {
                width: `${progress * 100}%`,
                backgroundColor: mode.colors.accent,
                shadowColor: mode.colors.accent,
              },
            ]}
          />
        </View>
      </View>

      {finished ? (
        <View style={styles.cardZone}>
          <Animated.View
            entering={enterAnim(ZoomIn.springify().damping(14))}
            style={styles.endBox}
          >
            <Text style={styles.endEmoji}>🏁</Text>
            <Text style={[styles.endTitle, { color: mode.colors.text }]}>C’est terminé !</Text>
            <Text style={styles.endSubtitle}>
              Bravo (ou pas). Buvez une dernière gorgée pour la route.
            </Text>
            {nextLevel && mode.levels && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  startGame(mode, nextLevel);
                }}
                style={({ pressed }) => [
                  styles.endBtn,
                  { backgroundColor: mode.colors.accent, shadowColor: mode.colors.accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.endBtnText, { color: mode.colors.onAccent }]}>
                  Niveau {nextLevel} : {mode.levels[nextLevel - 1]}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startGame(mode, level ?? undefined);
              }}
              style={({ pressed }) => [
                nextLevel
                  ? styles.endBtnGhost
                  : [
                      styles.endBtn,
                      { backgroundColor: mode.colors.accent, shadowColor: mode.colors.accent },
                    ],
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={
                  nextLevel
                    ? styles.endBtnGhostText
                    : [styles.endBtnText, { color: mode.colors.onAccent }]
                }
              >
                {level ? 'Rejouer ce niveau' : 'Rejouer ce mode'}
              </Text>
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
          <Animated.View
            key={index}
            entering={enterAnim(FadeInDown.springify().damping(17).stiffness(160))}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.kindPill,
                card?.isFollowUp
                  ? styles.kindPillFollowUp
                  : { backgroundColor: mode.colors.accent, shadowColor: mode.colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.kindPillText,
                  { color: card?.isFollowUp ? mode.colors.accent : mode.colors.onAccent },
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modeName: { fontSize: 16, fontWeight: '900' },
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
    backgroundColor: 'rgba(0,0,0,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  cardZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  cardContent: { alignItems: 'center', gap: 26 },
  kindPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  kindPillFollowUp: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    shadowOpacity: 0,
    elevation: 0,
  },
  kindPillText: { fontSize: 14, fontWeight: '900', letterSpacing: 0.3 },
  cardText: {
    fontSize: 28,
    lineHeight: 39,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tapHint: {
    position: 'absolute',
    bottom: 18,
    color: 'rgba(255,255,255,0.4)',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  counter: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '800' },
  endBox: { alignItems: 'center', gap: 12, width: '100%' },
  endEmoji: { fontSize: 64 },
  endTitle: { fontSize: 34, fontWeight: '900' },
  endSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  endBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  endBtnText: { fontSize: 16, fontWeight: '900' },
  endBtnGhost: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  endBtnGhostText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
