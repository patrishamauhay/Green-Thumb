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

const MQTT_BROKER = "ws://test.mosquitto.org:8080";
const MOISTURE_TOPIC = "plant/sensor/moisture";
const RELAY_TOPIC = "relay_control";
const MOISTURE_THRESHOLD = 30;

export default function WaterPlant({ navigation }) {
  const [lastWatered, setLastWatered] = useState(null);
  const [isWatering, setIsWatering] = useState(false);
  const [wateringDuration, setWateringDuration] = useState(2);
  const [client, setClient] = useState(null);
  const [isAutoWateringEnabled, setIsAutoWateringEnabled] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(0);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      mqttClient.subscribe(MOISTURE_TOPIC);
    });

    mqttClient.on("message", async (topic, message) => {
      if (topic === MOISTURE_TOPIC) {
        const moisture = parseInt(message.toString(), 10);
        console.log("📡 Moisture Received:", moisture);
        setSoilMoisture(moisture);
        if (moisture < MOISTURE_THRESHOLD && isAutoWateringEnabled) {
          const today = new Date().toISOString().split('T')[0];
          const lastAutoWatered = await AsyncStorage.getItem('lastAutoWatered');
          if (lastAutoWatered !== today) {
            Alert.alert(
              "Low Moisture Detected",
              `Soil moisture is ${moisture}%. Start watering?`,
              [
                { text: "No", style: "cancel" },
                {
                  text: "Yes", onPress: () => {
                    PushNotification.localNotification({
                      channelId: "plant-care-channel",
                      title: "Watering Started",
                      message: `Watering started automatically due to low moisture.`,
                    });
                    AsyncStorage.setItem('lastAutoWatered', today);
                    handleWaterPlant();
                  }
                }
              ]
            );
          } else {
            console.log("ℹ️ Already watered today.");
          }
        }
      }
    });

    mqttClient.on("error", (err) => console.error("MQTT Error:", err));
    setClient(mqttClient);
    return () => mqttClient.end();
  }, [isAutoWateringEnabled]);

  useEffect(() => {
    loadLastWatered();

    PushNotification.configure({
      onNotification: notification => console.log("🔔 Notification:", notification),
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel({
      channelId: "plant-care-channel",
      channelName: "Plant Care Alerts",
      channelDescription: "Alerts for moisture and watering",
      importance: 4,
      vibrate: true,
    });

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
  }, []);

  const loadLastWatered = async () => {
    const storedTime = await AsyncStorage.getItem('lastWatered');
    if (storedTime) setLastWatered(storedTime);
  };

  const pushWateringEntry = async (entry) => {
    const raw = await AsyncStorage.getItem('wateringHistory');
    const history = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem('wateringHistory', JSON.stringify([entry, ...history]));
  };

  const sendMQTTMessage = (message) => {
    if (client) client.publish(RELAY_TOPIC, message);
  };

  const handleWaterPlant = async () => {
    setIsWatering(true);
    sendMQTTMessage("ON");

    setTimeout(async () => {
      sendMQTTMessage("OFF");
      const now = new Date().toLocaleString();
      setLastWatered(now);
      await AsyncStorage.setItem('lastWatered', now);
      await pushWateringEntry(`${now}, ${wateringDuration}s`);
      Alert.alert('Success', `Watered for ${wateringDuration} seconds.`);
      setIsWatering(false);
    }, wateringDuration * 1000);
  };

  return (
    <LinearGradient colors={['#26f2bc', '#5B86E5']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Water Plant</Text>
        <Ionicons name="settings-outline" size={28} color="#fff" />
      </View>

      <View style={styles.plantContainer}>
        <Ionicons name="leaf-outline" size={80} color="white" />
        <Text style={{ color: '#fff', marginTop: 10, fontSize: 18 }}>
          Soil Moisture: {soilMoisture}%
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>Watering Duration: {wateringDuration} sec</Text>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={10}
          step={1}
          value={wateringDuration}
          onValueChange={setWateringDuration}
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
        <Text style={styles.autoWateringText}>Enable Auto Watering</Text>
        <Switch value={isAutoWateringEnabled} onValueChange={setIsAutoWateringEnabled} />
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

      {/* <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          PushNotification.localNotification({
            channelId: "plant-care-channel",
            title: "Test Notification",
            message: "This is a test alert!",
            playSound: true,
            vibrate: true,
          });
        }}
      >
        <Text style={styles.buttonText}>TEST NOTIFICATION</Text>
      </TouchableOpacity> */}

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
