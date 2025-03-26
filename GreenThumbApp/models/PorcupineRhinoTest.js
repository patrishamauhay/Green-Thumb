import { useEffect, useRef, useState } from 'react';
import { Alert, PermissionsAndroid, Platform, ToastAndroid, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import { PorcupineManager } from '@picovoice/porcupine-react-native';
import { RhinoManager } from '@picovoice/rhino-react-native';
import AudioRecord from 'react-native-audio-record';

export default function usePorcupineRhino() {
  const porcupineManagerRef = useRef(null);
  const rhinoManagerRef = useRef(null);
  const [picovoiceStatus, setPicovoiceStatus] = useState('Initializing...');
  const [isListening, setIsListening] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  // ✅ Enhanced permission handling with visual feedback
  const requestMicrophonePermission = async () => {
    try {
      setPermissionRequested(true);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Access',
            message: 'Picovoice needs microphone access to hear your commands',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          ToastAndroid.show('Microphone access granted', ToastAndroid.SHORT);
          return true;
        } else {
          Alert.alert(
            'Permission Required',
            'Voice commands require microphone access',
            [
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
              { text: 'Cancel' },
            ]
          );
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  // ✅ Combined permission check
  const checkAllPermissions = async () => {
    const micGranted = await requestMicrophonePermission();
    if (!micGranted) return false;

    if (Platform.OS === 'android') {
      try {
        const storageGranted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          storageGranted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          storageGranted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }
    return true;
  };

  // ✅ Enhanced microphone test with visual feedback
  const testMicrophone = async () => {
    try {
      setPicovoiceStatus('Testing microphone...');
      
      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: `${RNFS.DocumentDirectoryPath}/mic_test.wav`
      };

      AudioRecord.init(options);
      AudioRecord.start();
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const audioFile = await AudioRecord.stop();
            const fileExists = await RNFS.exists(audioFile);
            const fileStats = await RNFS.stat(audioFile);
            
            if (fileExists && fileStats.size > 0) {
              setPicovoiceStatus('Microphone ready');
              Alert.alert('Success', 'Microphone is working! Picovoice can hear you now.');
              resolve(true);
            } else {
              setPicovoiceStatus('Microphone failed');
              Alert.alert('Error', 'Microphone test failed. Please check permissions.');
              resolve(false);
            }
          } catch (error) {
            console.error('Microphone test error:', error);
            setPicovoiceStatus('Microphone error');
            resolve(false);
          }
        }, 3000);
      });
    } catch (error) {
      console.error('Microphone setup error:', error);
      return false;
    }
  };

  // ✅ Initialize Picovoice with status updates
  const initializePicovoice = async () => {
    try {
      setPicovoiceStatus('Checking permissions...');
      const permissionsGranted = await checkAllPermissions();
      if (!permissionsGranted) {
        setPicovoiceStatus('Permissions denied');
        return;
      }

      setPicovoiceStatus('Testing microphone...');
      const micWorking = await testMicrophone();
      if (!micWorking) {
        setPicovoiceStatus('Microphone unavailable');
        return;
      }

      setPicovoiceStatus('Loading voice models...');
      const intentModelPath = '/sdcard/Android/data/com.greenthumbapp/files/intent_model.rhn';
      const wakeWordPath = '/sdcard/Android/data/com.greenthumbapp/files/hey_green_thumb.ppn';

      const [modelExists, wakeWordExists] = await Promise.all([
        RNFS.exists(intentModelPath),
        RNFS.exists(wakeWordPath)
      ]);

      if (!modelExists || !wakeWordExists) {
        setPicovoiceStatus('Model files missing');
        Alert.alert('Error', 'Voice model files not found');
        return;
      }

      setPicovoiceStatus('Initializing Rhino...');
      rhinoManagerRef.current = await RhinoManager.create(
        intentModelPath,
        null,
        (inference) => {
          if (inference.isFinalized) {
            handleCommand(inference.intent);
          }
        }
      );

      setPicovoiceStatus('Initializing Porcupine...');
      porcupineManagerRef.current = await PorcupineManager.fromKeywordPaths(
        [wakeWordPath],
        (keywordIndex) => {
          if (keywordIndex === 0) {
            Alert.alert('Picovoice Active', 'Wake word detected! Listening for commands...');
            startListening();
          }
        },
        { 
          sampleRate: 16000,
          processErrorCallback: (error) => {
            console.error('Porcupine error:', error);
            setPicovoiceStatus(`Error: ${error.message}`);
          }
        }
      );

      setPicovoiceStatus('Ready - Say "Hey Green Thumb"');
      await porcupineManagerRef.current.start();
      setIsListening(true);
      Alert.alert('Picovoice Active', 'Voice control is now active! Say "Hey Green Thumb" to begin.');

    } catch (err) {
      console.error('Initialization error:', err);
      setPicovoiceStatus(`Error: ${err.message}`);
      Alert.alert('Initialization Failed', `Picovoice couldn't start: ${err.message}`);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await rhinoManagerRef.current.start();
      setPicovoiceStatus('Listening for commands...');
    } catch (error) {
      console.error('Listening error:', error);
      setIsListening(false);
    }
  };

  const handleCommand = (command) => {
    let response = '';
    switch (command) {
      case 'Water':
        response = 'Watering the plant...';
        break;
      case 'Check moisture':
        response = 'Checking soil moisture...';
        break;
      default:
        response = `Unrecognized command: ${command}`;
    }
    
    setPicovoiceStatus(`Command: ${command}`);
    Alert.alert('Command Received', response);
  };

  useEffect(() => {
    // Request permissions immediately when component mounts
    const requestPermissions = async () => {
      await requestMicrophonePermission();
      initializePicovoice();
    };
    
    requestPermissions();
    
    return () => {
      if (porcupineManagerRef.current) {
        porcupineManagerRef.current.stop();
        setIsListening(false);
      }
      if (rhinoManagerRef.current) {
        rhinoManagerRef.current.stop();
      }
    };
  }, []);

  // Return status information for UI
  return {
    picovoiceStatus,
    isListening,
    permissionRequested,
    testMicrophone,
    initializePicovoice
  };
}