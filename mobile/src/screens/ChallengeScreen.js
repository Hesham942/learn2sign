import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { predictSign } from '../api';

const API_URL = 'http://172.20.10.9:8000';
const LETTERS = ['A', 'B', 'C', 'D']; // Only supported letters for now
const CONFIDENCE_THRESHOLD = 0.7;
const MAX_FAILURES = 3;

const getRandomLetter = (exclude = null) => {
  let letter;
  do {
    letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (letter === exclude);
  return letter;
};

export default function ChallengeScreen({ navigation }) {
  const [permission] = useCameraPermissions();
  const [targetLetter, setTargetLetter] = useState(getRandomLetter());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const isCapturingRef = useRef(false);

  const captureAndPredict = async () => {
    if (!cameraRef.current || isGameOver || lastResult || !isMountedRef.current || isCapturingRef.current) return;
    
    isCapturingRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      
      if (!isMountedRef.current) return;
      
      if (photo?.base64) {
        const result = await predictSign(photo.base64, API_URL);
        
        if (!isMountedRef.current) return;
        
        setPrediction(result);
        
        if (result.landmarks_detected && result.confidence >= CONFIDENCE_THRESHOLD) {
          if (result.letter === targetLetter) {
            setLastResult('correct');
            setScore(prev => prev + 1);
            setStreak(prev => prev + 1);
            setConsecutiveFailures(0);
            
            setTimeout(() => {
              if (isMountedRef.current) {
                setLastResult(null);
                setTargetLetter(getRandomLetter(targetLetter));
              }
            }, 800);
          } else {
            setLastResult('wrong');
            setStreak(0);
            const newFailures = consecutiveFailures + 1;
            setConsecutiveFailures(newFailures);
            
            if (newFailures >= MAX_FAILURES) {
              setIsGameOver(true);
            } else {
              setTimeout(() => {
                if (isMountedRef.current) {
                  setLastResult(null);
                }
              }, 1000);
            }
          }
        }
      }
    } catch (e) {
      if (isMountedRef.current) {
        console.log('Capture error:', e.message);
      }
    } finally {
      isCapturingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (!isGameOver) {
      intervalRef.current = setInterval(captureAndPredict, 600);
    }
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isGameOver, targetLetter, lastResult]);

  const handlePlayAgain = () => {
    setScore(0);
    setStreak(0);
    setConsecutiveFailures(0);
    setIsGameOver(false);
    setLastResult(null);
    setTargetLetter(getRandomLetter());
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required</Text>
      </View>
    );
  }

  if (isGameOver) {
    return (
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverEmoji}>🏆</Text>
        <Text style={styles.gameOverTitle}>Challenge Complete!</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front">
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.statSmall}>
              <Text style={styles.statSmallValue}>{score}</Text>
              <Text style={styles.statSmallLabel}>Score</Text>
            </View>
            <View style={styles.statSmall}>
              <Text style={styles.statSmallValue}>{streak}🔥</Text>
              <Text style={styles.statSmallLabel}>Streak</Text>
            </View>
            <View style={styles.livesContainer}>
              {[...Array(MAX_FAILURES)].map((_, i) => (
                <Text key={i} style={styles.life}>
                  {i < MAX_FAILURES - consecutiveFailures ? '❤️' : '🖤'}
                </Text>
              ))}
            </View>
          </View>
          
          <View style={[
            styles.targetContainer,
            lastResult === 'correct' && styles.targetCorrect,
            lastResult === 'wrong' && styles.targetWrong,
          ]}>
            <Text style={styles.targetLabel}>Sign:</Text>
            <Text style={styles.targetLetter}>{targetLetter}</Text>
            {lastResult === 'correct' && <Text style={styles.resultText}>✓ Correct!</Text>}
            {lastResult === 'wrong' && <Text style={styles.resultText}>✗ Try again!</Text>}
          </View>
          
          <View style={styles.feedbackContainer}>
            {prediction?.landmarks_detected ? (
              <Text style={styles.detected}>Detected: {prediction.letter}</Text>
            ) : (
              <Text style={styles.noHand}>Show your hand</Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSmall: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
    minWidth: 70,
  },
  statSmallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statSmallLabel: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  livesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
  life: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  targetContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  targetCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  targetWrong: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  targetLabel: {
    fontSize: 18,
    color: '#AAAAAA',
    marginBottom: 10,
  },
  targetLetter: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  feedbackContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  detected: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  noHand: {
    fontSize: 18,
    color: '#FFC107',
  },
  gameOverContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  statBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 10,
    minWidth: 100,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
