import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SIGNS = [
  { letter: 'A', description: 'Fist with thumb beside' },
  { letter: 'B', description: 'Flat hand, fingers up' },
  { letter: 'C', description: 'Curved hand like C' },
  { letter: 'D', description: 'Index up, others touch thumb' },
];

export default function ReferenceGuide({ visible, onClose }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Supported Signs</Text>
        <View style={styles.signsContainer}>
          {SIGNS.map((sign) => (
            <View key={sign.letter} style={styles.signItem}>
              <Text style={styles.signLetter}>{sign.letter}</Text>
              <Text style={styles.signDesc}>{sign.description}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 350,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  signsContainer: {
    gap: 15,
  },
  signItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    padding: 15,
    borderRadius: 12,
  },
  signLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 60,
    textAlign: 'center',
  },
  signDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
