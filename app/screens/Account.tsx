import React from 'react';
import { Alert, Platform, View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../stores/useAuth';
import { getStat } from '../db/statsRepo';
import AnimatedButton from '../components/AnimatedButton';

const STAT_KEYS = [
  {
    key: 'cards_studied',
    label: 'Cards Studied',
    icon: 'cards-outline' as const,
    badgeBg: '#eef2ff',
    iconColor: '#6366f1',
  },
  {
    key: 'sessions_completed',
    label: 'Sessions Completed',
    icon: 'check-circle-outline' as const,
    badgeBg: '#f0fdf4',
    iconColor: '#16a34a',
  },
  {
    key: 'cards_mastered',
    label: 'Cards Mastered',
    icon: 'star-outline' as const,
    badgeBg: '#fef3c7',
    iconColor: '#d97706',
  },
];

const Account: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = React.useState<Array<{ metric: string; value: string; config: typeof STAT_KEYS[number] }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const rows = await Promise.all(
          STAT_KEYS.map(async (config) => {
            const value = await getStat(currentUser, config.key);
            return { metric: config.label, value: String(value), config };
          })
        );
        if (mounted) setStats(rows);
      } catch {
        if (mounted) setStats([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentUser]);

  const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
    } else {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Profile header card */}
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={styles.username}>{currentUser || '-'}</Text>
        <Text style={styles.memberLabel}>Member</Text>
      </View>

      {/* Stats card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activity</Text>
        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : stats.length === 0 ? (
          <Text style={styles.muted}>No stats saved yet.</Text>
        ) : (
          stats.map((s, i) => (
            <React.Fragment key={s.metric}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statRow}>
                <View style={styles.statLeft}>
                  <View style={[styles.iconBadge, { backgroundColor: s.config.badgeBg }]}>
                    <MaterialCommunityIcons name={s.config.icon} size={16} color={s.config.iconColor} />
                  </View>
                  <Text style={styles.statLabel}>{s.metric}</Text>
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
            </React.Fragment>
          ))
        )}
      </View>

      {/* Logout button */}
      <AnimatedButton style={styles.logoutButton} onPress={handleLogout} hapticFeedback="medium">
        <MaterialCommunityIcons name="logout" size={18} color="#dc2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </AnimatedButton>
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
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#6366f1',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  memberLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  muted: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
});

export default Account;
