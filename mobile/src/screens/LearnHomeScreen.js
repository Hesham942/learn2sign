import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function LearnHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Learn ASL</Text>
      <Text style={styles.subtitle}>Master the alphabet</Text>
      
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <Text style={styles.progressValue}>0%</Text>
        <Text style={styles.progressHint}>0 of 26 letters mastered</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.navigate('LetterSelect')}
      >
        <Text style={styles.menuIcon}>🔤</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Practice Letters</Text>
          <Text style={styles.menuDesc}>Choose a letter to practice</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.navigate('Challenge')}
      >
        <Text style={styles.menuIcon}>🎯</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Challenge Mode</Text>
          <Text style={styles.menuDesc}>Test your skills with random letters</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressHint: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  menuButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
    color: '#888888',
  },
  menuArrow: {
    fontSize: 24,
    color: '#666666',
  },
});
