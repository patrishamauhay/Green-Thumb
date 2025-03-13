import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

export default function VoiceControlButton() {
  const [isListening, setIsListening] = useState(false);

  // Simulate the action to test the button
  const handlePress = () => {
    Alert.alert('Button Pressed', 'Testing button without voice recognition');
    setIsListening(true);

    // Reset state after 2 seconds
    setTimeout(() => setIsListening(false), 2000);
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handlePress}
      disabled={isListening}
    >
      <Text style={styles.buttonText}>
        {isListening ? 'Listening...' : 'Start Test'}
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
