import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SensorScreen({ navigation }) {
  const [sensorId, setSensorId] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');

  const handleAssignSensor = () => {
    if (!sensorId.trim() || !selectedPlant.trim()) {
      Alert.alert('Error', 'Please enter a sensor ID and select a plant.');
      return;
    }
    Alert.alert('Success', `Sensor ${sensorId} assigned to ${selectedPlant}!`);
    setSensorId('');
    setSelectedPlant('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={28} color="#333" />
          </TouchableOpacity>
          <Ionicons name="wifi-outline" size={30} color="#2E6F40" />
          <Text style={styles.title}>Sensor Configuration</Text>
        </View>

        <Text style={styles.subtitle}>
          Assign a plant from "My Garden" to a soil moisture sensor.
        </Text>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Enter Sensor ID"
          value={sensorId}
          onChangeText={setSensorId}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Plant Name"
          value={selectedPlant}
          onChangeText={setSelectedPlant}
        />

        {/* Assign Sensor Button */}
        <TouchableOpacity style={styles.assignButton} onPress={handleAssignSensor}>
          <Text style={styles.assignButtonText}>Assign Sensor</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  assignButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

