import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function PredictionOverlay({ prediction, isLoading, error }) {
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  if (!prediction) {
    return (
      <View style={styles.container}>
        <Text style={styles.hintText}>Show your hand to the camera</Text>
      </View>
    );
  }

  if (!prediction.landmarks_detected) {
    return (
      <View style={styles.container}>
        <Text style={styles.noHandText}>No hand detected</Text>
        <Text style={styles.hintText}>Position your hand in frame</Text>
      </View>
    );
  }

  const confidencePercent = Math.round(prediction.confidence * 100);
  const confidenceColor = confidencePercent >= 80 ? '#4CAF50' : 
                          confidencePercent >= 50 ? '#FFC107' : '#F44336';

  return (
    <View style={styles.container}>
      <Text style={styles.letterText}>{prediction.letter}</Text>
      <View style={[styles.confidenceBar, { backgroundColor: confidenceColor }]}>
        <Text style={styles.confidenceText}>{confidencePercent}% confident</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  letterText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  confidenceBar: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  noHandText: {
    fontSize: 24,
    color: '#FFC107',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  hintText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
});
