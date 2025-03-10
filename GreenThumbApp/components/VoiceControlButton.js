import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import Voice from '@react-native-voice/voice'; // Import voice library

export default function VoiceControlButton() {
  const [isListening, setIsListening] = useState(false);

  // Initialize voice commands
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event) => {
    const results = event.value;
    if (results && results[0].toLowerCase().includes('water my plant')) {
      Alert.alert('Voice Command', 'Watering the plant...');
      // Add your watering function here
    }
  };

  const onSpeechError = (error) => {
    console.error('Speech error:', error);
  };

  // Start listening for voice commands
  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={startListening}
      disabled={isListening}
    >
      <Text style={styles.buttonText}>
        {isListening ? 'Listening...' : 'Start Voice Command'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
