import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { predictSign, checkHealth } from '../api';
import PredictionOverlay from '../PredictionOverlay';
import ReferenceGuide from '../ReferenceGuide';

const DEFAULT_API_URL = 'http://172.20.10.9:8000';

export default function RecognizeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isConnected, setIsConnected] = useState(false);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const healthy = await checkHealth(apiUrl);
      if (healthy) {
        setIsConnected(true);
        setShowSettings(false);
        startCapturing();
      } else {
        setError('Cannot connect to backend. Check IP and ensure server is running.');
      }
    } catch (e) {
      setError('Connection failed: ' + e.message);
    }
    setIsLoading(false);
  };

  const captureAndPredict = async () => {
    if (!cameraRef.current || isLoading) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        skipProcessing: false,
        exif: false,
      });
      
      if (photo?.base64) {
        const result = await predictSign(photo.base64, apiUrl);
        setPrediction(result);
        setError(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const startCapturing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(captureAndPredict, 1500);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>We need camera access to detect hand signs</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showSettings) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🤟 ASL Recognition</Text>
        <Text style={styles.subtitle}>Connect to Backend</Text>
        
        <Text style={styles.label}>Backend URL:</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.x.x:8000"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.hint}>
          Find your computer's IP by running 'ipconfig' in CMD
        </Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Connecting...' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowGuide(true)}
          >
            <Text style={styles.iconText}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setShowSettings(true);
              setIsConnected(false);
            }}
          >
            <Text style={styles.iconText}>⚙</Text>
          </TouchableOpacity>
        </View>
        
        <PredictionOverlay 
          prediction={prediction}
          isLoading={isLoading}
          error={error}
        />
      </CameraView>
      
      <ReferenceGuide visible={showGuide} onClose={() => setShowGuide(false)} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#AAAAAA',
    marginBottom: 30,
  },
  text: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#AAAAAA',
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#2D5A2E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
