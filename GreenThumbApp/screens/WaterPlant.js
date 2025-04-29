// Water Screen

import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch, Platform, PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import mqtt from 'mqtt/dist/mqtt'; 
import 'react-native-url-polyfill/auto'; 
import PushNotification from 'react-native-push-notification';
import ScheduleWater from '../components/ScheduleWater';

const MQTT_BROKER = "ws://test.mosquitto.org:8080"; // WebSocket connection for MQTT
const TOPIC = "relay_control"; 

export default function WaterPlant({ navigation }) {
  const [lastWatered, setLastWatered] = useState(null);
  const [isWatering, setIsWatering] = useState(false);
  const [wateringDuration, setWateringDuration] = useState(2);
  const [client, setClient] = useState(null);
  const [isAutoWateringEnabled, setIsAutoWateringEnabled] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(0);

  const MOISTURE_THRESHOLD = 30;

  useEffect(() => {
    // Connect to MQTT broker
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT Error:", err);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  useEffect(() => {
    // Load last watering time
    loadLastWatered();

    // Configure Push Notifications
    PushNotification.configure({
      onNotification: function (notification) {
        console.log("Local Notification Received:", notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // Create Notification Channel (IMPORTANT)
    PushNotification.createChannel(
      {
        channelId: "plant-care-channel", // (required)
        channelName: "Plant Care Alerts", // (required)
        channelDescription: "A channel for plant watering and moisture alerts",
        importance: 4, // Max
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );

    // Request Notification Permission on Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        .then((result) => {
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Notification permission granted.");
          } else {
            console.log("Notification permission denied.");
          }
        });
    }

    // Auto-watering interval if enabled
    if (isAutoWateringEnabled) {
      const interval = setInterval(() => {
        checkSoilMoisture();
      }, 15000); // every 15 seconds now
      return () => clearInterval(interval);
    }
  }, [isAutoWateringEnabled]);

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

  const pushWateringEntry = async (entry) => {
    try {
      const raw = await AsyncStorage.getItem('wateringHistory');
      const history = raw ? JSON.parse(raw) : [];
      const newHistory = [entry, ...history];
      await AsyncStorage.setItem('wateringHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save watering history', error);
    }
  };

  const [lastMoistureAlert, setLastMoistureAlert] = useState(false);

  const checkSoilMoisture = () => {
    // In future: Read real sensor value here
    const moistureLevel = Math.floor(Math.random() * 100); // Simulate sensor
    setSoilMoisture(moistureLevel);
    console.log(`Soil Moisture: ${moistureLevel}%`);
  
    if (moistureLevel < MOISTURE_THRESHOLD) {
      if (!lastMoistureAlert) { 
        PushNotification.localNotification({
          channelId: "plant-care-channel",
          title: "Low Moisture Alert ",
          message: `Soil moisture is low (${moistureLevel}%). Please water your plant!`,
          playSound: true,
          soundName: 'default',
          vibrate: true,
        });
        setLastMoistureAlert(true);
      }
      handleWaterPlant();
    } else {
      setLastMoistureAlert(false);
    }
  };
  

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

    sendMQTTMessage("ON");

    setTimeout(async () => {
      sendMQTTMessage("OFF");

      const now = new Date().toLocaleString();
      setLastWatered(now);

      try {
        await AsyncStorage.setItem('lastWatered', now);
        const entry = `${now}, ${wateringDuration}s`;
        await pushWateringEntry(entry);
        Alert.alert('Success', `Your plant has been watered for ${wateringDuration} seconds!`);
      } catch (error) {
        console.error('Failed to save watering data', error);
      }

      setIsWatering(false);
    }, wateringDuration * 1000);
  };

  return (
    <LinearGradient colors={['#26f2bc', '#5B86E5']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}></TouchableOpacity>
        <Text style={styles.title}>Water Plant</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.plantContainer}>
        <Ionicons name="leaf-outline" size={80} color="white" />
      </View>

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
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>2s</Text>
          <Text style={styles.sliderLabel}>5s</Text>
          <Text style={styles.sliderLabel}>10s</Text>
        </View>
      </View>

      <View style={styles.autoWateringContainer}>
        <Text style={styles.autoWateringText}>Enable Automatic Watering</Text>
        <Switch
          value={isAutoWateringEnabled}
          onValueChange={setIsAutoWateringEnabled}
        />
      </View>

      <TouchableOpacity 
        style={[styles.waterButton, isWatering && styles.disabledButton]} 
        onPress={handleWaterPlant}
        disabled={isWatering}
      >
        {isWatering ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>START WATERING</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => navigation.navigate('WaterHistory')}
      >
        <Text style={styles.buttonText}>VIEW HISTORY</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => {
          PushNotification.localNotification({
            channelId: "plant-care-channel",
            title: "Test Notification",
            message: "This is a test! Notifications are working",
            playSound: true,
            soundName: 'default',
            vibrate: true,
          });
        }}
      >
        <Text style={styles.buttonText}>TEST NOTIFICATION</Text>
      </TouchableOpacity>

      <ScheduleWater onScheduleSet={(date) => console.log(`Scheduled at: ${date}`)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: 'center' },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  plantContainer: { marginTop: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 20, borderRadius: 20, alignItems: 'center' },
  sliderContainer: { width: '80%', alignItems: 'center', marginTop: 10 },
  sliderText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  slider: { width: '100%' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 5 },
  sliderLabel: { fontSize: 14, color: '#fff' },
  autoWateringContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  autoWateringText: { fontSize: 16, color: '#fff', marginRight: 10 },
  waterButton: { width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 30, borderWidth: 2, borderColor: '#fff' },
  historyButton: { width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 15, borderWidth: 2, borderColor: '#fff' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  disabledButton: { opacity: 0.5 },
  testButton: { width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 15, borderWidth: 2, borderColor: '#fff' },
});
