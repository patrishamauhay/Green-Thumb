import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

export default function WaterPlant({ navigation }) {
  const [isWatering, setIsWatering] = useState(false);
  const [wateringDuration, setWateringDuration] = useState(2);

  // Save only the last watered time
  const saveWateringTime = async (time) => {
    try {
      await AsyncStorage.setItem('lastWatered', time);
    } catch (error) {
      console.error('Failed to save watering time', error);
    }
  };

  const handleWaterPlant = async () => {
    setIsWatering(true);
    setTimeout(async () => {
      const now = new Date().toLocaleString();
      await saveWateringTime(now);
      Alert.alert('Success', `Your plant has been watered for ${wateringDuration} seconds!`);
      setIsWatering(false);
    }, wateringDuration * 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Your Plant</Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>Watering Duration: {wateringDuration} sec</Text>
        <Slider
          style={{ width: 250, height: 40 }}
          minimumValue={2}
          maximumValue={10}
          step={1}
          value={wateringDuration}
          onValueChange={(value) => setWateringDuration(value)}
          minimumTrackTintColor="#2E6F40"
          maximumTrackTintColor="#A5D6A7"
          thumbTintColor="#2E6F40"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isWatering && styles.disabledButton]} 
        onPress={handleWaterPlant}
        disabled={isWatering}
      >
        {isWatering ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Water Plant</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.waterButton} 
        onPress={() => navigation.navigate('WaterHistory')}
      >
        <Text style={styles.buttonText}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E6F40',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    backgroundColor: '#2E6F40',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  waterButton: {
    width: '80%',
    backgroundColor: '#004d40',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
