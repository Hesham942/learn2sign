import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';

// Hand sign instructions for each letter
const LETTER_GUIDES = {
  A: {
    emoji: '✊',
    title: 'Letter A',
    description: 'Make a fist with your thumb resting on the side',
    steps: [
      'Make a fist with all fingers curled in',
      'Keep your thumb on the side of your fist (not tucked in)',
      'Your thumb should rest against your index finger',
      'Palm faces forward'
    ],
    tips: 'Think of it like making a fist, but with thumb visible on the side',
  },
  B: {
    emoji: '🖐️',
    title: 'Letter B',
    description: 'Flat hand with fingers together, thumb tucked',
    steps: [
      'Hold your hand up with palm facing forward',
      'Keep all four fingers straight and together',
      'Tuck your thumb across your palm',
      'Fingers should point upward'
    ],
    tips: 'Like a "stop" hand signal, but with thumb tucked in',
  },
  C: {
    emoji: '🤏',
    title: 'Letter C',
    description: 'Curved hand forming the shape of letter C',
    steps: [
      'Curve your fingers and thumb',
      'Form a "C" shape with your hand',
      'Keep space between thumb and fingers',
      'Palm faces to the side'
    ],
    tips: 'Imagine holding a cup or grabbing something round',
  },
  D: {
    emoji: '☝️',
    title: 'Letter D',
    description: 'Index finger up, other fingers touch thumb',
    steps: [
      'Point your index finger straight up',
      'Curl your middle, ring, and pinky fingers',
      'Touch the tips of curled fingers to your thumb',
      'This forms a circle with thumb and other fingers'
    ],
    tips: 'Index finger points up while others make a circle with thumb',
  },
};

export default function LearnLetterScreen({ route, navigation }) {
  const { letter } = route.params;
  const guide = LETTER_GUIDES[letter];
  const [currentStep, setCurrentStep] = useState(0);

  if (!guide) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Guide not available for letter {letter}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{guide.emoji}</Text>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.description}>{guide.description}</Text>
      </View>

      {/* Step by step guide */}
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>How to Sign</Text>
        {guide.steps.map((step, index) => (
          <View 
            key={index} 
            style={[
              styles.stepItem,
              currentStep === index && styles.stepItemActive
            ]}
          >
            <View style={[
              styles.stepNumber,
              currentStep === index && styles.stepNumberActive
            ]}>
              <Text style={[
                styles.stepNumberText,
                currentStep === index && styles.stepNumberTextActive
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepText,
              currentStep === index && styles.stepTextActive
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tip</Text>
        <Text style={styles.tipsText}>{guide.tips}</Text>
      </View>

      {/* Navigation buttons */}
      <View style={styles.stepNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        
        <Text style={styles.stepIndicator}>
          Step {currentStep + 1} of {guide.steps.length}
        </Text>
        
        <TouchableOpacity 
          style={[styles.navButton, currentStep === guide.steps.length - 1 && styles.navButtonDisabled]}
          onPress={() => setCurrentStep(Math.min(guide.steps.length - 1, currentStep + 1))}
          disabled={currentStep === guide.steps.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Practice button */}
      <TouchableOpacity 
        style={styles.practiceButton}
        onPress={() => navigation.navigate('Practice', { letter })}
      >
        <Text style={styles.practiceButtonText}>Practice Now</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Letters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  stepsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
  },
  stepItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    color: '#888888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepNumberTextActive: {
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#AAAAAA',
    lineHeight: 24,
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  tipsContainer: {
    backgroundColor: '#2D4A2D',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  stepIndicator: {
    color: '#888888',
    fontSize: 14,
  },
  practiceButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
