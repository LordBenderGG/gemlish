import React, { useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLevelData, getLevelIcon, Word } from '@/data/lessons';
import { useGame } from '@/context/GameContext';
import { useSpeech } from '@/hooks/use-speech';

function WordReviewCard({ word }: { word: Word }) {
  const { speaking, toggle, currentWord } = useSpeech();
  const isThisWordSpeaking = speaking && currentWord === word.word;

  return (
    <View style={styles.wordCard}>
      <View style={styles.wordRow}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordEn}>{word.word}</Text>
          <Text style={styles.wordPron}>{word.pronunciation}</Text>
          <Text style={styles.wordEs}>{word.translation}</Text>
        </View>
        <TouchableOpacity
          style={[styles.speakBtn, isThisWordSpeaking && styles.speakBtnActive]}
          onPress={() => toggle(word.word)}
          activeOpacity={0.7}
        >
          <Text style={styles.speakBtnText}>{isThisWordSpeaking ? '⏹' : '🔊'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.exampleBox}>
        <Text style={styles.exampleEn}>"{word.example}"</Text>
        <Text style={styles.exampleEs}>{word.exampleEs}</Text>
      </View>
    </View>
  );
}

export default function LevelDetailScreen() {
  const insets = useSafeAreaInsets();
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const levelNum = parseInt(levelId || '1', 10);
  const { game } = useGame();

  const levelData = useMemo(() => getLevelData(levelNum), [levelNum]);
  const icon = useMemo(() => getLevelIcon(levelNum), [levelNum]);
  const isCompleted = !!game.levelProgress[levelNum]?.completed;

  const handleStartLevel = useCallback(() => {
    router.replace(`/exercise/${levelNum}` as any);
  }, [levelNum]);

  const renderItem = useCallback(({ item }: { item: Word }) => (
    <WordReviewCard word={item} />
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={[styles.levelBadge, { backgroundColor: levelData.color + '22', borderColor: levelData.color }]}>
          <Text style={styles.levelBadgeText}>{icon} Nivel {levelNum}</Text>
        </View>
      </View>

      {/* Info del nivel */}
      <View style={[styles.levelInfo, { borderBottomColor: levelData.color + '40' }]}>
        <Text style={[styles.levelName, { color: levelData.color }]}>{levelData.name}</Text>
        <View style={styles.levelMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>📝 {levelData.words.length} palabras</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⭐ {levelData.xp} XP</Text>
          </View>
          {isCompleted && (
            <View style={[styles.metaChip, styles.metaCompleted]}>
              <Text style={styles.metaText}>✅ Completado</Text>
            </View>
          )}
        </View>
        <Text style={styles.levelDesc}>
          Repasa las palabras de este nivel y practica su pronunciación antes de empezar.
        </Text>
      </View>

      {/* Lista de palabras */}
      <FlatList
        data={levelData.words}
        keyExtractor={(item) => item.word}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>📚 Palabras del nivel</Text>
        }
      />

      {/* Botón de acción */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: levelData.color }]}
          onPress={handleStartLevel}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>
            {isCompleted ? '🔄 Repetir nivel' : '▶ Empezar nivel'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1117' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { paddingVertical: 8, paddingRight: 16 },
  backText: { color: '#1CB0F6', fontSize: 15, fontWeight: '600' },
  levelBadge: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1,
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  levelInfo: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1,
  },
  levelName: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  levelMeta: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  metaChip: {
    backgroundColor: '#1A1D27', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#2D3148',
  },
  metaCompleted: { borderColor: '#58CC02', backgroundColor: '#1A3A1A' },
  metaText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  levelDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, paddingHorizontal: 16 },
  list: { paddingTop: 16, paddingBottom: 20 },
  wordCard: {
    backgroundColor: '#1A1D27', borderRadius: 14, padding: 14, marginBottom: 10,
    marginHorizontal: 16, borderWidth: 1, borderColor: '#2D3148',
  },
  wordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  wordInfo: { flex: 1 },
  wordEn: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  wordPron: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 },
  wordEs: { fontSize: 15, fontWeight: '600', color: '#1CB0F6', marginTop: 4 },
  speakBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1CB0F620', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1CB0F640',
  },
  speakBtnActive: { backgroundColor: '#1CB0F640', borderColor: '#1CB0F6' },
  speakBtnText: { fontSize: 20 },
  exampleBox: {
    backgroundColor: '#0F1117', borderRadius: 8, padding: 10,
    borderLeftWidth: 3, borderLeftColor: '#8E5AF5',
  },
  exampleEn: { fontSize: 13, color: '#FFFFFF', fontStyle: 'italic', marginBottom: 3, lineHeight: 18 },
  exampleEs: { fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#2D3148', backgroundColor: '#0F1117',
  },
  startBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
