import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Alert,
  TextInput,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';

import Separator from '../components/Separator';

export default function More({ navigation }) {
  const [user, setUser] = useState(null);
  const [sensorId, setSensorId] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAssignSensor = () => {
    if (!sensorId || !selectedPlant) {
      Alert.alert('Error', 'Please enter a sensor ID and select a plant.');
      return;
    }
    Alert.alert('Success', `Sensor ${sensorId} assigned to ${selectedPlant}!`);
    setSensorId('');
    setSelectedPlant('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}> More Actions</Text>
      </View>
  
      <Separator />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.widgetsContainer}>
          {/* Sensor Configuration Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="wifi-outline" size={40} color="#2E6F40" />
            <Text style={styles.widgetText}>Sensors</Text>
          </TouchableOpacity>

          {/* Set Reminder Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="alarm-outline" size={40} color="#2E6F40" />
            <Text style={styles.widgetText}>Set Reminder</Text>
          </TouchableOpacity>

          {/* Water Tank Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="water-outline" size={40} color="#2E6F40" />
            <Text style={styles.widgetText}>Water Tank</Text>
          </TouchableOpacity>

          {/* Light Meter Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="bulb-outline" size={40} color="#2E6F40" />
            <Text style={styles.widgetText}>Light Meter</Text>
          </TouchableOpacity>
        </View>

        {/* Sensor Configuration Widget (with wifi-outline icon) */}
        <View style={styles.widgetBox}>
          <View style={styles.widgetHeader}>
            <Ionicons name="wifi-outline" size={30} color="#2E6F40" />
            <Text style={styles.widgetTitle}>Sensor Configuration</Text>
          </View>
          <Text style={styles.widgetSubtitle}>
            Assign a plant from "My Garden" to a soil moisture sensor.
          </Text>

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

          <TouchableOpacity style={styles.assignButton} onPress={handleAssignSensor}>
            <Text style={styles.assignButtonText}>Assign Sensor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button at Bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  content: {
    paddingHorizontal: 20,
  },
  widgetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  widget: {
    width: width * 0.4,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  widgetText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  widgetBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
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
  logoutButton: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: width * 0.9,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

