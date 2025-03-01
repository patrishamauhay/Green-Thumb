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


// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';

// const DashboardSection = () => {
//   const [plants, setPlants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPlant, setSelectedPlant] = useState(null);
//   const [sensorData, setSensorData] = useState(null);
//   const userId = auth().currentUser?.uid;

//   // Fetch user's plants
//   useEffect(() => {
//     if (userId) {
//       const unsubscribe = firestore()
//         .collection('users')
//         .doc(userId)
//         .collection('myGarden')
//         .onSnapshot((snapshot) => {
//           const plantList = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setPlants(plantList);
//           setLoading(false);
//         });

//       return unsubscribe;
//     }
//   }, [userId]);

//   // Fetch the assigned plant and latest sensor data
//   useEffect(() => {
//     if (userId) {
//       const userRef = firestore().collection('users').doc(userId);

//       // Get the assigned plant
//       const unsubscribeUser = userRef.onSnapshot((doc) => {
//         if (doc.exists) {
//           const assignedPlantId = doc.data().activeSensorPlant;
//           setSelectedPlant(assignedPlantId);

//           if (assignedPlantId) {
//             // Listen for real-time sensor data updates
//             const sensorRef = userRef
//               .collection('myGarden')
//               .doc(assignedPlantId)
//               .collection('sensorData')
//               .orderBy('timestamp', 'desc')
//               .limit(1);

//             const unsubscribeSensor = sensorRef.onSnapshot((snapshot) => {
//               if (!snapshot.empty) {
//                 const latestData = snapshot.docs[0].data();
//                 setSensorData(latestData);
//               }
//             });

//             return () => unsubscribeSensor();
//           }
//         }
//       });

//       return () => unsubscribeUser();
//     }
//   }, [userId]);

//   const assignSensorToPlant = async (plantId) => {
//     try {
//       await firestore()
//         .collection('users')
//         .doc(userId)
//         .update({ activeSensorPlant: plantId }); // Store the assigned plant
//       setSelectedPlant(plantId);
//       setSensorData(null); // Reset sensor data until new data arrives
//     } catch (error) {
//       console.error("Error assigning sensor:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text>Loading plants...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Assign Sensor to a Plant</Text>

//       {plants.map((plant) => (
//         <TouchableOpacity
//           key={plant.id}
//           style={[styles.plantButton, selectedPlant === plant.id && styles.selectedPlant]}
//           onPress={() => assignSensorToPlant(plant.id)}
//         >
//           <Text style={styles.plantText}>{plant.userPlantName || plant.commonName}</Text>
//         </TouchableOpacity>
//       ))}

//       {selectedPlant && (
//         <Text style={styles.confirmationText}>
//           Sensor is currently assigned to: {plants.find(p => p.id === selectedPlant)?.userPlantName || "Unknown"}
//         </Text>
//       )}

//       {/* Display latest sensor data */}
//       {sensorData ? (
//         <View style={styles.sensorContainer}>
//           <Text style={styles.sensorTitle}>Latest Sensor Data</Text>
//           <Text style={styles.sensorText}>💡 Light: {sensorData.Light.toFixed(2)}%</Text>
//           <Text style={styles.sensorText}>💧 Soil Moisture: {sensorData["Soil Moisture"].toFixed(2)}%</Text>
//         </View>
//       ) : (
//         <Text style={styles.noSensorData}>Waiting for sensor data...</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, alignItems: 'center' },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   plantButton: {
//     backgroundColor: '#ddd',
//     padding: 12,
//     borderRadius: 8,
//     width: '80%',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   selectedPlant: {
//     backgroundColor: '#4CAF50',
//   },
//   plantText: { fontSize: 16, fontWeight: 'bold' },
//   confirmationText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
//   sensorContainer: {
//     marginTop: 20,
//     padding: 15,
//     borderRadius: 10,
//     backgroundColor: '#E3F2FD',
//     width: '90%',
//     alignItems: 'center',
//   },
//   sensorTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
//   sensorText: { fontSize: 16, color: '#333', marginVertical: 2 },
//   noSensorData: { marginTop: 20, fontSize: 16, color: '#777' },
// });

// export default DashboardSection;

