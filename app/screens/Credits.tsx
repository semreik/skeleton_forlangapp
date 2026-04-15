import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
    <View style={styles.accentLine} />
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Credits: React.FC = () => {
  return (
    <ScrollView 
      style={[styles.scrollView, Platform.OS === 'web' && styles.webScrollView]}
      contentContainerStyle={[styles.container, Platform.OS === 'web' && styles.webContainer]}
      showsVerticalScrollIndicator={true}
      bounces={true}
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>Credits</Text>
        <View style={styles.titleAccent} />
        <Text variant="bodyMedium" style={styles.intro}>
          This app is a collaborative effort between Dzardzongke speakers and researchers from the
          University of Cambridge and the EPHE-PSL in Paris. We would like to thank XX for their generous
          funding to develop the first prototype of the app. The app will be accompanied by an introductory
          textbook to learn the Dzardzongke language.
        </Text>
      </View>

      <Section title="Dzardzongke speakers and collaborators">
        <Text style={styles.item}>• Palgen Bista</Text>
        <Text style={styles.item}>• Tshewang Gurung</Text>
        <Text style={styles.item}>• Lhabon Takla</Text>
        <Text style={styles.item}>• Tenzin Thakuri</Text>
        <Text style={styles.item}>• Kemi Tsewang</Text>
        <Text style={styles.item}>• Tsewang Khyenga</Text>
        <Text style={styles.item}>• Gyaltsen Muktivilla</Text>
      </Section>

      <Section title="Illustrations">
        <Text style={styles.item}>• Hilaria Cruz</Text>
        <Text style={styles.item}>• Kids at the Lubrak hostel: XX, YY, ZZ (TBC)</Text>
      </Section>

      <Section title="Research team">
        <Text style={styles.item}>• Hannah Claus (University of Cambridge)</Text>
        <Text style={styles.item}>• Songbo Hu (University of Cambridge)</Text>
        <Text style={styles.item}>• Emre Isik (University of Cambridge)</Text>
        <Text style={styles.item}>• Anna Korhonen (University of Cambridge)</Text>
        <Text style={styles.item}>• Kitty Liu (University of Cambridge)</Text>
        <Text style={styles.item}>• Marieke Meelen (University of Cambridge)</Text>
        <Text style={styles.item}>• Charles Ramble (EPHE-PSL, Paris)</Text>
      </Section>

      <Section title="Technical Development">
        <Text style={styles.item}>• React Native & Expo Framework</Text>
        <Text style={styles.item}>• TypeScript Implementation</Text>
        <Text style={styles.item}>• SQLite Database Integration</Text>
        <Text style={styles.item}>• Audio & Media Management</Text>
        <Text style={styles.item}>• Cross-platform Compatibility</Text>
      </Section>

      <Section title="Future Development">
        <Text style={styles.item}>• Advanced Learning Algorithms</Text>
        <Text style={styles.item}>• Community Features</Text>
        <Text style={styles.item}>• Offline Content Synchronization</Text>
        <Text style={styles.item}>• Multi-language Support Framework</Text>
        <Text style={styles.item}>• Analytics & Progress Tracking</Text>
      </Section>
      
      {/* Add some bottom padding to ensure last section is fully visible */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  webScrollView: {
    height: '100vh',
    overflow: 'auto',
  } as any,
  container: {
    padding: 16,
    paddingBottom: 32, // Extra bottom padding for better scrolling
    flexGrow: 1, // Ensures content can expand and scroll properly
  },
  webContainer: {
    minHeight: '100vh',
  } as any,
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  titleAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    marginBottom: 12,
  },
  intro: {
    textAlign: 'left',
    color: '#4b5563',
    lineHeight: 22,
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#6366f1',
    fontSize: 18,
    marginBottom: 4,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    marginVertical: 8,
  },
  sectionBody: {
    gap: 8,
  },
  item: {
    color: '#1f2937',
    fontSize: 16,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 20, // Extra space at bottom for better scrolling experience
  },
});

export default Credits;