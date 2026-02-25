import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const DRAWER_WIDTH = Math.min(280, Dimensions.get('window').width * 0.75);
const EDGE_ZONE = 40;
const BRACKET_WIDTH = 44;
const BRACKET_HEIGHT = 120;

const SPRING_CONFIG = {
  damping: 26,
  stiffness: 400,
};

const tabs = [
  { key: 'DeckStack', label: 'Decks', icon: 'albums-outline' as const, activeIcon: 'albums' as const },
  { key: 'Stats', label: 'Progress', icon: 'stats-chart-outline' as const, activeIcon: 'stats-chart' as const },
  { key: 'Dictionary', label: 'Dictionary', icon: 'book-outline' as const, activeIcon: 'book' as const },
  { key: 'Conversations', label: 'Chat', icon: 'chatbubbles-outline' as const, activeIcon: 'chatbubbles' as const },
  { key: 'MultipleChoice', label: 'Quiz', icon: 'checkbox-outline' as const, activeIcon: 'checkbox' as const },
  { key: 'Culture', label: 'Culture', icon: 'earth-outline' as const, activeIcon: 'earth' as const },
];

const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onToggle,
  currentTab,
  onTabChange,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const startedInEdge = useSharedValue(false);
  const hasPeeked = useRef(false);

  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : -DRAWER_WIDTH, SPRING_CONFIG);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !hasPeeked.current) {
      hasPeeked.current = true;
      const timer = setTimeout(() => {
        translateX.value = withSpring(0, SPRING_CONFIG, () => {
          translateX.value = withSpring(-DRAWER_WIDTH, SPRING_CONFIG);
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const open = () => { if (!isOpen) onToggle(); };
  const close = () => { if (isOpen) onToggle(); };

  // Bracket drag — only activates for real drags (>15px), taps fall through to Pressable
  const bracketPan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      const base = isOpen ? 0 : -DRAWER_WIDTH;
      translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, base + e.translationX));
    })
    .onEnd((e) => {
      const shouldOpen = translateX.value > -DRAWER_WIDTH / 2 || e.velocityX > 500;
      translateX.value = withSpring(shouldOpen ? 0 : -DRAWER_WIDTH, SPRING_CONFIG);
      if (shouldOpen) { runOnJS(open)(); } else { runOnJS(close)(); }
    });

  // Edge swipe on content area
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      startedInEdge.value = e.x < EDGE_ZONE || translateX.value > -DRAWER_WIDTH + 10;
    })
    .activeOffsetX([-20, 20])
    .failOffsetY([-30, 30])
    .onUpdate((e) => {
      if (!startedInEdge.value) return;
      const base = isOpen ? 0 : -DRAWER_WIDTH;
      translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, base + e.translationX));
    })
    .onEnd((e) => {
      if (!startedInEdge.value) return;
      const shouldOpen = translateX.value > -DRAWER_WIDTH / 2 || e.velocityX > 500;
      translateX.value = withSpring(shouldOpen ? 0 : -DRAWER_WIDTH, SPRING_CONFIG);
      if (shouldOpen) { runOnJS(open)(); } else { runOnJS(close)(); }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 0.5]),
    pointerEvents: translateX.value > -DRAWER_WIDTH + 5 ? 'auto' : 'none',
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 180])}deg` }],
  }));

  return (
    <View style={styles.root}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.contentWrap}>
          {children}
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, drawerStyle, { paddingTop: insets.top + 16, width: DRAWER_WIDTH }]}
      >
        <Text style={styles.drawerTitle}>Dzardzongke</Text>
        <View style={styles.divider} />
        <View pointerEvents={isOpen ? 'auto' : 'none'}>
          {tabs.map((tab) => {
            const active = currentTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.drawerItem, active && styles.drawerItemActive]}
                onPress={() => onTabChange(tab.key)}
              >
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon}
                  size={22}
                  color={active ? '#6366f1' : '#64748b'}
                />
                <Text style={[styles.drawerLabel, active && styles.drawerLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Bracket — Pan for drag, Pressable for tap (Pan cancels Pressable when dragging) */}
      <GestureDetector gesture={bracketPan}>
        <Animated.View style={[styles.bracket, drawerStyle, { top: insets.top + 14 }]}>
          <Pressable style={styles.bracketPressable} onPress={onToggle}>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-forward" size={22} color="#6366f1" />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 20,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
    paddingHorizontal: 12,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.5,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  drawerItemActive: {
    backgroundColor: '#eef2ff',
    borderLeftColor: '#6366f1',
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  drawerLabelActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  bracket: {
    position: 'absolute',
    left: DRAWER_WIDTH - 1,
    width: BRACKET_WIDTH,
    height: BRACKET_HEIGHT,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 18,
  },
  bracketPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppDrawer;
