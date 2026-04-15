import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../stores/useAuth';
import AnimatedButton from './AnimatedButton';

type MenuItemConfig = {
  label: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badgeBg: string;
  iconColor: string;
  onPress: () => void;
};

const ModernTopNavigation: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuth();

  const openMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleLogout = useCallback(() => {
    closeMenu();
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  }, [closeMenu, logout]);

  const menuItems: MenuItemConfig[] = [
    {
      label: 'Account',
      subtitle: 'Your profile',
      icon: 'account-circle-outline',
      badgeBg: '#eef2ff',
      iconColor: '#6366f1',
      onPress: () => { closeMenu(); navigation.navigate('Account'); },
    },
    {
      label: 'Settings',
      subtitle: 'Preferences',
      icon: 'cog-outline',
      badgeBg: '#f0fdf4',
      iconColor: '#16a34a',
      onPress: () => { closeMenu(); navigation.navigate('Settings'); },
    },
    {
      label: 'Saved',
      subtitle: 'Saved items',
      icon: 'bookmark-outline',
      badgeBg: '#fef3c7',
      iconColor: '#d97706',
      onPress: () => { closeMenu(); navigation.navigate('Profile'); },
    },
    {
      label: 'Credits',
      subtitle: 'About the app',
      icon: 'information-outline',
      badgeBg: '#f0f9ff',
      iconColor: '#0284c7',
      onPress: () => { closeMenu(); navigation.navigate('Credits'); },
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>Dzardzongke</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Learn • Practice • Master</Text>
          </View>
        </View>

        {/* Three dots menu trigger */}
        <AnimatedButton onPress={openMenu} style={styles.menuButton} hapticFeedback="light">
          <MaterialCommunityIcons name="dots-vertical" size={20} color="#6366f1" />
        </AnimatedButton>

        {/* Custom dropdown modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.overlay} onPress={closeMenu}>
            <Animated.View
              entering={FadeIn.duration(150)}
              style={[styles.dropdown, { top: insets.top + 52, right: 20 }]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                {menuItems.map((item) => (
                  <AnimatedButton
                    key={item.label}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    hapticFeedback="light"
                  >
                    <View style={[styles.iconBadge, { backgroundColor: item.badgeBg }]}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={item.iconColor} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </AnimatedButton>
                ))}

                {/* Divider before logout */}
                <View style={styles.menuDivider} />

                <AnimatedButton
                  style={styles.menuItem}
                  onPress={handleLogout}
                  hapticFeedback="light"
                >
                  <View style={[styles.iconBadge, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="logout" size={18} color="#dc2626" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Logout</Text>
                    <Text style={styles.menuSubtitle}>Sign out</Text>
                  </View>
                </AnimatedButton>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 56,
    paddingRight: 20,
    paddingBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdown: {
    position: 'absolute',
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginVertical: 4,
  },
});

export default ModernTopNavigation;
