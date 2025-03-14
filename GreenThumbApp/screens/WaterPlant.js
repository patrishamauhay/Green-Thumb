import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import mqtt from 'mqtt/dist/mqtt';  // Import MQTT library (correct path)
import 'react-native-url-polyfill/auto';  // Import URL polyfill for WebSocket support

import ScheduleWater from '../components/ScheduleWater';

const MQTT_BROKER = "ws://test.mosquitto.org:8080"; // WebSocket connection for MQTT
const TOPIC = "relay_control";  // Original topic from your old code

export default function WaterPlant({ navigation }) {
  const [lastWatered, setLastWatered] = useState(null);
  const [isWatering, setIsWatering] = useState(false);
  const [wateringDuration, setWateringDuration] = useState(2); // Duration set by the user
  const [client, setClient] = useState(null);

  // Connect to MQTT broker when the component mounts
  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT Error:", err);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end(); // Disconnect when component unmounts
    };
  }, []);

  // Load last watering time from AsyncStorage
  useEffect(() => {
    loadLastWatered();
  }, []);

  const loadLastWatered = async () => {
    try {
      const storedTime = await AsyncStorage.getItem('lastWatered');
      if (storedTime) {
        setLastWatered(storedTime);
      }
    } catch (error) {
      console.error('Failed to load watering data', error);
    }
  };

  // Function to publish MQTT message
  const sendMQTTMessage = (message) => {
    if (client) {
      client.publish(TOPIC, message);
      console.log(`Sent MQTT Message: ${message}`);
    } else {
      console.error("MQTT Client is not connected");
    }
  };

  const handleWaterPlant = async () => {
    setIsWatering(true);

    // Send "ON" message to turn on the relay
    sendMQTTMessage("ON");

    setTimeout(async () => {
      // Send "OFF" message to turn off the relay after the set watering duration
      sendMQTTMessage("OFF");

      const now = new Date().toLocaleString();
      setLastWatered(now);

      try {
        await AsyncStorage.setItem('lastWatered', now);
        Alert.alert('Success', `Your plant has been watered for ${wateringDuration} seconds!`);
      } catch (error) {
        console.error('Failed to save watering data', error);
      }

      setIsWatering(false);
    }, wateringDuration * 1000); // Delay based on the user-selected watering duration
  };

  return (
    <LinearGradient colors={['#26f2bc', '#5B86E5']} style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        </TouchableOpacity>
        <Text style={styles.title}>Water Plant</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Plant Icon */}
      <View style={styles.plantContainer}>
        <Ionicons name="leaf-outline" size={80} color="white" />
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Soil Moisture</Text>
          <Text style={styles.statusValue}>DRY</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Light Level</Text>
          <Text style={styles.statusValue}>GOOD</Text>
        </View>
      </View>

      {/* Watering Duration Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>Watering Duration: {wateringDuration} sec</Text>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={10}
          step={1}
          value={wateringDuration}
          onValueChange={(value) => setWateringDuration(value)}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#B3E5FC"
          thumbTintColor="#fff"
        />

        {/* Numbers Below the Slider */}
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>2s</Text>
          <Text style={styles.sliderLabel}>5s</Text>
          <Text style={styles.sliderLabel}>10s</Text>
        </View>
      </View>

      {/* Start Watering Button */}
      <TouchableOpacity 
        style={[styles.waterButton, isWatering && styles.disabledButton]} 
        onPress={handleWaterPlant}
        disabled={isWatering}
      >
        {isWatering ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>START WATERING</Text>}
      </TouchableOpacity>

      {/* View History Button */}
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => navigation.navigate('WaterHistory')}
      >
        <Text style={styles.buttonText}>VIEW HISTORY</Text>
      </TouchableOpacity>

      <ScheduleWater onScheduleSet={(date) => console.log(`Scheduled at: ${date}`)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  plantContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },

  statusBox: {
    alignItems: 'center',
    padding: 10,
  },

  statusLabel: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },

  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },

  infoContainer: {
    padding: 15,
    backgroundColor: '#E3F2E1',
    borderRadius: 10,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 16,
    color: '#333',
  },

  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },

  sliderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },

  slider: {
    width: '100%',
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },

  sliderLabel: {
    fontSize: 14,
    color: '#fff',
  },

  waterButton: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },

  historyButton: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },

  disabledButton: {
    opacity: 0.5,
  },
});
