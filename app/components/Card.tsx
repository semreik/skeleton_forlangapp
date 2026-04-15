import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getDeckImage } from '../../assets/images';
import type { Card as CardType } from '../types/deck';

/* ── Layout math ── */
const { width: SW, height: SH } = Dimensions.get('window');
const MARGIN = 12;
const OUTER_PAD = 16; // Study screen padding
const CARD_W = SW - OUTER_PAD * 2 - MARGIN * 2;
const CARD_H = Math.min(CARD_W * 1.3, SH * 0.54);
const R = 20;

/* ── Color-word cards ── */
const COLORS: Record<string, string> = {
  white: '#FFFFFF', yellow: '#FFEB3B', black: '#212121',
  green: '#4CAF50', brown: '#795548', blue: '#2196F3',
  red: '#F44336', gray: '#9E9E9E', grey: '#9E9E9E',
};
const DARK = new Set(['#212121', '#2196F3', '#795548', '#4CAF50', '#F44336']);

interface Props {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  deckId?: string;
}

export const Card: React.FC<Props> = ({ card, isFlipped, onFlip, deckId = '' }) => {
  const img = card.image ? getDeckImage(deckId, card.image) : undefined;

  const fmt = (t: unknown) => {
    const s = typeof t === 'string' ? t : '';
    return card.id?.startsWith('animal-') ? s.toLowerCase() : s;
  };

  const text = fmt(isFlipped ? card.back : card.front);
  const notes = isFlipped && card.notes ? card.notes : null;

  /* ═══════════════════ Image card ═══════════════════ */
  if (img) {
    return (
      <View style={i.shadow}>
        <View style={i.card}>
          <TouchableOpacity
            onPress={onFlip}
            activeOpacity={0.92}
            style={i.touch}
          >
            {/* Hero image — fills card edge to edge */}
            <Image source={img} style={i.image} resizeMode="cover" />

            {/* Top vignette — subtle depth */}
            <LinearGradient
              colors={['rgba(0,0,0,0.25)', 'transparent']}
              style={i.topScrim}
              pointerEvents="none"
            />

            {/* Bottom gradient — smooth fade for text area */}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0,0,0,0.04)',
                'rgba(0,0,0,0.25)',
                'rgba(0,0,0,0.6)',
                'rgba(0,0,0,0.82)',
              ]}
              locations={[0, 0.35, 0.55, 0.78, 1]}
              style={i.bottomScrim}
              pointerEvents="none"
            />

            {/* Text — anchored to bottom */}
            <View style={i.textArea}>
              <Text style={i.title} numberOfLines={2}>{text}</Text>
              {notes ? (
                <Text style={i.subtitle} numberOfLines={2}>{notes}</Text>
              ) : null}
            </View>

            {/* Audio indicator */}
            {card.hasAudio ? (
              <View style={i.badge}>
                <Ionicons name="volume-high" size={16} color="#fff" />
              </View>
            ) : null}

            {/* Flip hint */}
            <View style={i.flipHint}>
              <Ionicons name="sync-outline" size={14} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ═══════════════════ Plain / color card ═══════════════════ */
  const key = typeof card.front === 'string' ? card.front.toLowerCase() : '';
  const bg = COLORS[key];
  const dark = bg ? DARK.has(bg) : false;

  return (
    <View style={p.shadow}>
      <TouchableOpacity
        onPress={onFlip}
        activeOpacity={0.92}
        style={[p.card, bg ? { backgroundColor: bg } : null]}
      >
        <Text style={[p.text, dark && p.light]} numberOfLines={2}>
          {text}
        </Text>
        {notes ? (
          <Text style={[p.notes, dark && p.light]} numberOfLines={3}>
            {notes}
          </Text>
        ) : null}
        {card.hasAudio ? (
          <Ionicons
            name="volume-high"
            size={22}
            color={dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)'}
            style={p.audio}
          />
        ) : null}
        <View style={p.flipHint}>
          <Ionicons name="sync-outline" size={14} color={dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.15)'} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

/* ═══════════════════ Image card styles ═══════════════════ */
const i = StyleSheet.create({
  shadow: {
    alignSelf: 'center',
    borderRadius: R,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 12,
    margin: MARGIN,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  touch: {
    flex: 1,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_H * 0.2,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_H * 0.6,
  },
  textArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  flipHint: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* ═══════════════════ Plain card styles ═══════════════════ */
const p = StyleSheet.create({
  shadow: {
    margin: MARGIN,
    borderRadius: R,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: R,
    padding: 28,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
  notes: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    lineHeight: 22,
  },
  light: { color: '#fff' },
  audio: {
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  flipHint: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
