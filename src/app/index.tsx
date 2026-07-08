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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

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
    <LinearGradient colors={['#16455C', '#0B1E28']} style={styles.flex}>
      <KeyboardAvoidingView
        style={[styles.flex, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.logo}>🍹</Text>
          <Text style={styles.title}>PICOGROS</Text>
          <Text style={styles.subtitle}>Le jeu qui met l’ambiance en soirée</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.card}>
          <Text style={styles.sectionTitle}>
            {players.length === 0
              ? 'Qui joue ce soir ?'
              : `${players.length} joueur${players.length > 1 ? 's' : ''}`}
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
              <Text style={styles.hint}>Ajoute au moins 2 joueurs pour commencer.</Text>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Prénom du joueur"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={name}
              onChangeText={setName}
              onSubmitEditing={submit}
              returnKeyType="done"
              submitBehavior="submit"
              maxLength={20}
            />
            <Pressable
              onPress={submit}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Pressable
            disabled={!canStart}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/modes');
            }}
            style={({ pressed }) => [
              styles.startBtn,
              !canStart && styles.startBtnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.startBtnText}>
              {canStart ? 'Choisir un mode  →' : 'Il faut au moins 2 joueurs'}
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 56, marginBottom: 4 },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
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
    backgroundColor: '#F5C518',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: { color: '#20303C', fontWeight: '700', fontSize: 15 },
  chipRemove: { color: 'rgba(32,48,60,0.55)', fontWeight: '900', fontSize: 12 },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBtn: {
    width: 48,
    borderRadius: 14,
    backgroundColor: '#F5C518',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#20303C', fontSize: 26, fontWeight: '800', marginTop: -2 },
  startBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F5C518',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#F5C518',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  startBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: { color: '#20303C', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
