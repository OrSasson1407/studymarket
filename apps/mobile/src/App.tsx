import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

/**
 * Root mobile component.
 * Navigation and screens will be wired here once React Navigation is configured.
 */
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>StudyMarket</Text>
        <Text style={styles.subtitle}>Mobile — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcf9' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo:      { fontSize: 32, fontWeight: '800', color: '#0A2F44' },
  subtitle:  { fontSize: 14, color: '#78716c' },
});
