import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const DashboardSection = ({ plantId, docId }) => {
    const [loading, setLoading] = useState(true);
    const [isActivated, setIsActivated] = useState(false);
    const [sensorData, setSensorData] = useState(null);
    const userId = auth().currentUser?.uid;

    useEffect(() => {
        if (!userId || !docId) return;

        const userRef = firestore().collection('users').doc(userId);

        // Check if user document exists
        userRef.get().then((doc) => {
            if (!doc.exists) {
                console.log("User document does not exist. Creating...");
                return userRef.set({ activeSensorPlant: null }, { merge: true });
            }
        });

        // Listen for activation status
        const unsubscribeUser = userRef.onSnapshot((doc) => {
            if (doc.exists) {
                const activePlantId = doc.data().activeSensorPlant;
                setIsActivated(activePlantId === docId);

                if (activePlantId === docId) {
                    // Listen for real-time sensor data updates
                    const sensorRef = userRef
                        .collection('myGarden')
                        .doc(docId)
                        .collection('sensorData')
                        .orderBy('timestamp', 'desc')
                        .limit(1);

                    const unsubscribeSensor = sensorRef.onSnapshot((snapshot) => {
                        if (!snapshot.empty) {
                            const latestData = snapshot.docs[0].data();
                            setSensorData(latestData);
                        }
                    });

                    return () => unsubscribeSensor();
                } else {
                    setSensorData(null);
                }
            }
            setLoading(false); // ✅ Ensure loading stops after activation check
        });

        return () => unsubscribeUser(); // ✅ Cleanup listener on unmount
    }, [userId, docId]);

    useEffect(() => {
        setSensorData(null); // ✅ Reset sensor data when switching plants
    }, [docId]);

    const toggleActivation = async () => {
        try {
            setLoading(true); // ✅ Indicate change in progress

            const userRef = firestore().collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.log("User document does not exist, creating...");
                await userRef.set({ activeSensorPlant: null, activeSensorUser: null }, { merge: true });
            }

            if (isActivated) {
                await userRef.update({
                    activeSensorPlant: null,
                    activeSensorUser: null, 
                });
                setIsActivated(false);
            } else {
                const activeUserQuery = await firestore().collection('users')
                    .where("activeSensorUser", "==", userId)
                    .get();

                if (!activeUserQuery.empty) {
                    activeUserQuery.forEach(async (doc) => {
                        await doc.ref.update({ activeSensorPlant: null, activeSensorUser: null });
                    });
                }

                await userRef.update({
                    activeSensorPlant: docId,
                    activeSensorUser: userId,
                });

                setIsActivated(true);
                setSensorData(null);
            }
        } catch (error) {
            console.error("Error updating sensor activation:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                    {isActivated ? "Sensor Activated" : "Activate Sensor"}
                </Text>
                <Switch
                    value={isActivated}
                    onValueChange={toggleActivation}
                    trackColor={{ false: "#ccc", true: "#4CAF50" }}
                    thumbColor={isActivated ? "#ffffff" : "#f4f4f4"}
                />
            </View>

            {isActivated ? (
                sensorData ? (
                    <View style={styles.sensorContainer}>
                        <Text style={styles.sensorTitle}>Latest Sensor Data</Text>
                        <Text style={styles.sensorText}>💡 Light: {sensorData.Light.toFixed(2)}%</Text>
                        <Text style={styles.sensorText}>💧 Soil Moisture: {sensorData["Soil Moisture"].toFixed(2)}%</Text>
                    </View>
                ) : (
                    <Text style={styles.noSensorData}>Waiting for sensor data...</Text>
                )
            ) : (
                <Text style={styles.noSensorData}>Activate sensor to receive data.</Text>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  toggleText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  sensorContainer: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    width: '90%',
    alignItems: 'center',
  },
  sensorTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  sensorText: { 
    fontSize: 16, 
    color: '#333', 
    marginVertical: 2 
  },
  noSensorData: { 
    marginTop: 20, 
    fontSize: 16, 
    color: '#777' 
  },
});

export default DashboardSection;
