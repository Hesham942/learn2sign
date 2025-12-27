import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { predictSign } from '../api';

const API_URL = 'http://172.20.10.9:8000';
const HOLD_DURATION = 2000; // 2 seconds
const CONFIDENCE_THRESHOLD = 0.7;

export default function PracticeScreen({ route, navigation }) {
  const { letter } = route.params;
  const [permission] = useCameraPermissions();
  const [prediction, setPrediction] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const holdStartRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const isCapturingRef = useRef(false);

  const captureAndPredict = async () => {
    if (!cameraRef.current || isSuccess || !isMountedRef.current || isCapturingRef.current) return;
    
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
        
        if (result.landmarks_detected && 
            result.letter === letter && 
            result.confidence >= CONFIDENCE_THRESHOLD) {
          if (!holdStartRef.current) {
            holdStartRef.current = Date.now();
            startHoldTimer();
          }
        } else {
          resetHold();
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

  const startHoldTimer = () => {
    if (holdIntervalRef.current) return;
    
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
      
      if (elapsed >= HOLD_DURATION) {
        // Success!
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setIsSuccess(true);
        setAttemptCount(prev => prev + 1);
      }
    }, 50);
  };

  const resetHold = () => {
    holdStartRef.current = null;
    setHoldProgress(0);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    resetHold();
    setPrediction(null);
  };

  useEffect(() => {
    isMountedRef.current = true;
    intervalRef.current = setInterval(captureAndPredict, 500);
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isSuccess]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required</Text>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Great Job!</Text>
        <Text style={styles.successText}>You signed "{letter}" correctly!</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
          <Text style={styles.buttonText}>Practice Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => navigation.navigate('LetterSelect')}
        >
          <Text style={styles.secondaryButtonText}>Choose Another Letter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCorrect = prediction?.landmarks_detected && 
                    prediction?.letter === letter && 
                    prediction?.confidence >= CONFIDENCE_THRESHOLD;

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front">
        <View style={styles.overlay}>
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>Sign this letter:</Text>
            <Text style={styles.targetLetter}>{letter}</Text>
          </View>
          
          <View style={styles.feedbackContainer}>
            {prediction?.landmarks_detected ? (
              <>
                <Text style={[
                  styles.detectedLetter,
                  isCorrect ? styles.correct : styles.incorrect
                ]}>
                  {prediction.letter}
                </Text>
                <Text style={styles.confidence}>
                  {Math.round(prediction.confidence * 100)}% confident
                </Text>
                
                {isCorrect && (
                  <View style={styles.holdContainer}>
                    <Text style={styles.holdText}>Hold it!</Text>
                    <View style={styles.holdBar}>
                      <View style={[styles.holdFill, { width: `${holdProgress}%` }]} />
                    </View>
                  </View>
                )}
              </>
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
    paddingTop: 60,
  },
  targetContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 16,
  },
  targetLabel: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  targetLetter: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feedbackContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  detectedLetter: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  correct: {
    color: '#4CAF50',
  },
  incorrect: {
    color: '#F44336',
  },
  confidence: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 8,
  },
  noHand: {
    fontSize: 20,
    color: '#FFC107',
  },
  holdContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  holdText: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 8,
  },
  holdBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  holdFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  successText: {
    fontSize: 18,
    color: '#AAAAAA',
    marginBottom: 40,
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
