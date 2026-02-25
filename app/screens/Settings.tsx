import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AnimatedButton from '../components/AnimatedButton';

const Settings: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.infoText}>
          This app is configured for Dzardzongke language learning.
        </Text>
        <Text style={styles.noteText}>
          Quechua content is preserved in the repository for future development.
        </Text>
      </View>

      {/* Navigation cards */}
      <View style={styles.card}>
        <AnimatedButton
          style={styles.navRow}
          onPress={() => navigation.navigate('Account')}
          hapticFeedback="light"
        >
          <View style={[styles.iconBadge, { backgroundColor: '#eef2ff' }]}>
            <MaterialCommunityIcons name="account-circle-outline" size={18} color="#6366f1" />
          </View>
          <Text style={styles.navLabel}>Account</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
        </AnimatedButton>

        <View style={styles.rowDivider} />

        <AnimatedButton
          style={styles.navRow}
          onPress={() => {}}
          hapticFeedback="light"
          disabled
        >
          <View style={[styles.iconBadge, { backgroundColor: '#f0f9ff' }]}>
            <MaterialCommunityIcons name="translate" size={18} color="#0284c7" />
          </View>
          <View style={styles.navLabelContainer}>
            <Text style={styles.navLabel}>Language</Text>
            <Text style={styles.navSubLabel}>Coming soon</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
        </AnimatedButton>
      </View>

      {/* App version */}
      <Text style={styles.version}>Dzardzongke App v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabelContainer: {
    flex: 1,
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  navSubLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  version: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Settings;
