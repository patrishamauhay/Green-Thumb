import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Alert,
  TextInput,
  Dimensions,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';

import Separator from '../components/Separator';

export default function More({ navigation }) {
  const [user, setUser] = useState(null);
  const [sensorId, setSensorId] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const slideAnim = useRef(new Animated.Value(Dimensions.get('screen').width)).current; // For side sheet

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

  // Open Side Sheet
  const openDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Close Side Sheet
  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('screen').width,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>More Actions</Text>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <Separator />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.widgetsContainer}>
          {/* Sensor Configuration Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="wifi-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Sensors</Text>
          </TouchableOpacity>

          {/* Set Reminder Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="alarm-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Set Reminder</Text>
          </TouchableOpacity>

          {/* Water Tank Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="water-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Water Tank</Text>
          </TouchableOpacity>

          {/* Light Meter Widget */}
          <TouchableOpacity style={styles.widget}>
            <Ionicons name="bulb-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Light Meter</Text>
          </TouchableOpacity>
        </View>

        {/* Sensor Configuration Widget */}
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

      {/* Side Sheet (Right Drawer) */}
      <Animated.View style={[styles.drawer, { left: slideAnim }]}>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeDrawer}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.drawerTitle}>Settings</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
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
    backgroundColor: '#179b9e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  widgetText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    padding: 20,
  },
  closeDrawer: {
    alignSelf: 'flex-end',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
