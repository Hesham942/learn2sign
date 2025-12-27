import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const LETTERS = ['A', 'B', 'C', 'D']; // Only supported letters for now

export default function LetterSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Letter</Text>
      <Text style={styles.subtitle}>Tap to practice</Text>
      
      <ScrollView contentContainerStyle={styles.grid}>
        {LETTERS.map((letter) => (
          <TouchableOpacity
            key={letter}
            style={styles.letterButton}
            onPress={() => navigation.navigate('LearnLetter', { letter })}
          >
            <Text style={styles.letterText}>{letter}</Text>
            <View style={styles.masteryBar}>
              <View style={[styles.masteryFill, { width: '0%' }]} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  letterButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  masteryBar: {
    width: '60%',
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});
