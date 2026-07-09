import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { enterAnim } from '@/lib/animations';
import { Glow } from '@/lib/glow';
import { theme } from '@/lib/theme';
import { useGame } from '@/store/game';

const STORAGE_KEY = 'picogros:players';

export default function PlayersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { players, addPlayer, removePlayer } = useGame();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && useGame.getState().players.length === 0) {
        try {
          (JSON.parse(raw) as string[]).forEach(addPlayer);
        } catch {}
      }
      hydrated.current = true;
    });
  }, [addPlayer]);

  useEffect(() => {
    if (hydrated.current) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(players)).catch(() => {});
    }
  }, [players]);

  const submit = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPlayer(name);
    setName('');
    inputRef.current?.focus();
  };

  const canStart = players.length >= 2;

  return (
    <LinearGradient colors={theme.night} style={styles.flex}>
      <Glow color={theme.accent} edge="top" height={300} />
      <Glow color={theme.accentAlt} edge="bottom" height={260} opacity={0.12} />

      <KeyboardAvoidingView
        style={[styles.flex, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          entering={enterAnim(ZoomIn.springify().damping(14).delay(50))}
          style={styles.header}
        >
          <Text style={styles.logo}>🍹</Text>
          <Text style={styles.title}>
            PICO
            <Text style={styles.titleAccent}>GROS</Text>
          </Text>
          <Text style={styles.subtitle}>Le jeu qui met l’ambiance en soirée</Text>
        </Animated.View>

        <Animated.View
          entering={enterAnim(FadeInUp.springify().damping(16).delay(150))}
          style={styles.card}
        >
          <Text style={styles.sectionTitle}>
            {players.length === 0
              ? 'Qui joue ce soir ?'
              : `${players.length} joueur${players.length > 1 ? 's' : ''} dans la place`}
          </Text>

          <ScrollView
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}
            keyboardShouldPersistTaps="handled"
          >
            {players.map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  removePlayer(p);
                }}
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                <Text style={styles.chipText}>{p}</Text>
                <Text style={styles.chipRemove}>✕</Text>
              </Pressable>
            ))}
            {players.length === 0 && (
              <Text style={styles.hint}>
                Ajoute au moins 2 joueurs pour lancer la soirée. Tape sur un prénom pour le
                retirer.
              </Text>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Prénom du joueur"
              placeholderTextColor={theme.text35}
              value={name}
              onChangeText={setName}
              onSubmitEditing={submit}
              returnKeyType="done"
              submitBehavior="submit"
              maxLength={20}
            />
            <Pressable
              onPress={submit}
              style={({ pressed }) => [styles.addBtnWrap, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={theme.cta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={enterAnim(FadeInDown.springify().damping(16).delay(300))}>
          <Pressable
            disabled={!canStart}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/modes');
            }}
            style={({ pressed }) => [
              styles.startBtnWrap,
              canStart && styles.startBtnGlow,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={canStart ? theme.cta : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
                {canStart ? 'Choisir un mode  →' : 'Il faut au moins 2 joueurs'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 60, marginBottom: 6 },
  title: {
    fontSize: 46,
    fontWeight: '900',
    color: theme.white,
    letterSpacing: 5,
  },
  titleAccent: { color: theme.accent },
  subtitle: {
    color: theme.text60,
    fontSize: 15,
    marginTop: 6,
  },
  card: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: theme.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
  },
  sectionTitle: {
    color: theme.white,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },
  chipsScroll: { flex: 1 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
    shadowColor: theme.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipText: { color: theme.onAccent, fontWeight: '800', fontSize: 15 },
  chipRemove: { color: 'rgba(51,16,54,0.5)', fontWeight: '900', fontSize: 12 },
  hint: { color: theme.text45, fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  input: {
    flex: 1,
    backgroundColor: theme.inset,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: theme.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
  },
  addBtnWrap: {
    borderRadius: 16,
    shadowColor: theme.accentAlt,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  addBtn: {
    width: 50,
    height: '100%',
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: theme.onAccent, fontSize: 27, fontWeight: '800', marginTop: -2 },
  startBtnWrap: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 20,
  },
  startBtnGlow: {
    shadowColor: theme.accentAlt,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },
  startBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: { color: theme.onAccent, fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  startBtnTextDisabled: { color: theme.text45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});
