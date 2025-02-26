// 'Water Plant' Screen
// Publishes message to ESP32 to turn off/on the relay

import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt from 'mqtt/dist/mqtt';
import 'react-native-url-polyfill/auto';

// MQTT Configuration
const MQTT_BROKER = "ws://test.mosquitto.org:8080"; // WebSocket connection for MQTT
const TOPIC = "relay_control";

export default function WaterPlant() {
  const [lastWatered, setLastWatered] = useState(null);
  const [isWatering, setIsWatering] = useState(false);
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
      // Send "OFF" message to turn off the relay after 2 seconds
      sendMQTTMessage("OFF");

      const now = new Date().toLocaleString();
      setLastWatered(now);

      try {
        await AsyncStorage.setItem('lastWatered', now);
        Alert.alert('Success', 'Your plant has been watered!');
      } catch (error) {
        console.error('Failed to save watering data', error);
      }

      setIsWatering(false);
    }, 2000); // Simulates watering delay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Your Plant</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {lastWatered ? `Last watered: ${lastWatered}` : 'You haven\'t watered this plant yet!'}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isWatering && styles.disabledButton]} 
        onPress={handleWaterPlant}
        disabled={isWatering}
      >
        {isWatering ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Water Plant</Text>}
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
  button: {
    width: '80%',
    backgroundColor: '#2E6F40',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});
