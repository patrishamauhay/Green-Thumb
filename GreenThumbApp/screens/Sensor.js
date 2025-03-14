import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function SensorScreen({ navigation }) {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [plants, setPlants] = useState([]);
  const [assignedPlantId, setAssignedPlantId] = useState(null);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (userId) {
      // Load plants from Firestore
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .onSnapshot((snapshot) => {
          const plantList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlants(plantList);

          // ✅ Check which plant the sensor is assigned to
          const assignedPlant = plantList.find((plant) => plant.sensorAssigned);
          setAssignedPlantId(assignedPlant ? assignedPlant.id : null);
        });

      return unsubscribe;
    }
  }, [userId]);

  // ✅ Assign Sensor to Selected Plant
  const handleAssignSensor = async () => {
    if (!selectedPlant) {
      Alert.alert('Error', 'Please select a plant.');
      return;
    }

    try {
      // ✅ Remove sensor assignment from previously assigned plant (if any)
      if (assignedPlantId) {
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('myGarden')
          .doc(assignedPlantId)
          .update({ sensorAssigned: false });
      }

      // ✅ Assign sensor to the new plant
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(selectedPlant)
        .update({ sensorAssigned: true });

      Alert.alert('Success', `Sensor assigned to plant!`);
      setAssignedPlantId(selectedPlant);
      setSelectedPlant('');
    } catch (error) {
      console.error('Error assigning sensor:', error);
      Alert.alert('Error', 'Failed to assign sensor.');
    }
  };

  // ✅ Unassign the sensor from the current plant
  const handleUnassignSensor = async () => {
    if (!assignedPlantId) {
      Alert.alert('Error', 'No plant currently assigned to the sensor.');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(assignedPlantId)
        .update({ sensorAssigned: false });

      Alert.alert('Success', 'Sensor unassigned.');
      setAssignedPlantId(null);
    } catch (error) {
      console.error('Error unassigning sensor:', error);
      Alert.alert('Error', 'Failed to unassign sensor.');
    }
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
          Assign a plant from "My Garden" to a sensor.
        </Text>

        {/* Plant Dropdown */}
        {plants.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            style={[
              styles.plantButton,
              selectedPlant === plant.id && styles.selectedPlant,
              assignedPlantId === plant.id && styles.assignedPlant,
            ]}
            onPress={() => setSelectedPlant(plant.id)}
          >
            <Text style={styles.plantText}>
              {plant.userPlantName || plant.commonName}
              {assignedPlantId === plant.id && ' (Assigned)'}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Assign Sensor Button */}
        <TouchableOpacity
          style={styles.assignButton}
          onPress={handleAssignSensor}
          disabled={!selectedPlant}
        >
          <Text style={styles.assignButtonText}>Assign Sensor</Text>
        </TouchableOpacity>

        {/* Unassign Sensor Button */}
        {assignedPlantId && (
          <TouchableOpacity
            style={styles.unassignButton}
            onPress={handleUnassignSensor}
          >
            <Text style={styles.unassignButtonText}>Unassign Sensor</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
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
  plantButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  selectedPlant: {
    backgroundColor: '#4CAF50',
  },
  assignedPlant: {
    backgroundColor: '#FFCC00', // Yellow background for assigned sensor
  },
  plantText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  unassignButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  unassignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
