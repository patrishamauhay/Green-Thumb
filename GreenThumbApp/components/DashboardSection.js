import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const DashboardSection = ({ plantId, docId }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId || !docId) return;

    const userRef = firestore().collection("users").doc(userId);
    const plantRef = userRef.collection("myGarden").doc(docId);

    // Listen for changes in the activated plant and its sensor data
    const unsubscribe = plantRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            setIsActivated(data.Activated || false); // ✅ Check if the plant is activated
            
            // ✅ Always show the last known sensor data, even if deactivated
            if (data.latestSensorData) {
                setSensorData(data.latestSensorData);
            }
        }
    });

    return () => unsubscribe(); // Cleanup on unmount
}, [userId, docId]); // ✅ Runs when userId or docId changes



const toggleActivation = async () => {
    if (!userId || !docId) {
        console.error("🚨 Missing userId or docId!");
        setErrorMessage("Missing userId or plantId.");
        return;
    }

    const userRef = firestore().collection("users").doc(userId);
    const plantRef = userRef.collection("myGarden").doc(docId);

    try {
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.warn("⚠️ User document does not exist. Creating...");
            await userRef.set({ activeSensorPlant: null, activeSensorUser: null }, { merge: true });
        }

        const currentlyActivePlant = userDoc.data()?.activeSensorPlant || null;

        if (currentlyActivePlant === docId) {
            console.log("❌ Deactivating plant...");
            
            // ✅ Deactivate the plant but DO NOT clear the latestSensorData
            await userRef.update({
                activeSensorPlant: null,
                activeSensorUser: null,
            });

            await plantRef.update({ Activated: false }); // ✅ Keep latestSensorData
            setIsActivated(false);
        } else {
            console.log(`✅ Activating plant: ${docId}`);

            // ✅ First, find the currently active plant and deactivate it
            if (currentlyActivePlant) {
                const previousPlantRef = userRef.collection("myGarden").doc(currentlyActivePlant);
                await previousPlantRef.update({ Activated: false });
            }

            // ✅ Activate the new plant
            await userRef.update({
                activeSensorPlant: docId,
                activeSensorUser: userId,
            });

            await plantRef.update({ Activated: true }); // ✅ Set the new plant to active
            setIsActivated(true);
        }

        setErrorMessage(null);
    } catch (error) {
        console.error("🔥 Firestore Update Error:", error);
        setErrorMessage("Failed to update activation.");
        Alert.alert("Error", "Could not update activation. Please try again.");
    }
};


  return (
    <View style={styles.container}>
      {errorMessage && <Text style={styles.errorText}>⚠️ {errorMessage}</Text>}

      <Text style={styles.statusText}>
        {isActivated ? "🌿 Sensor is Activated" : "❌ Sensor is OFF"}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.onButton]}
          onPress={toggleActivation}
        >
          <Text style={styles.buttonText}>Toggle Activation</Text>
        </TouchableOpacity>
      </View>

      {/* Sensor Data Section */}
      {isActivated ? (
        sensorData ? (
          <View style={styles.sensorContainer}>
            <Text style={styles.sensorTitle}>🌱 Latest Sensor Data:</Text>
            <Text style={styles.sensorText}>💡 Light: {sensorData.Light?.toFixed(2)}%</Text>
            <Text style={styles.sensorText}>
              💧 Soil Moisture: {sensorData["Soil Moisture"]?.toFixed(2)}%
            </Text>
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
  container: { flex: 1, padding: 20, alignItems: "center" },
  errorText: { color: "red", fontWeight: "bold", marginBottom: 10 },
  statusText: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  buttonContainer: { flexDirection: "row", justifyContent: "center", width: "80%" },
  button: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8, marginHorizontal: 5 },
  onButton: { backgroundColor: "#4CAF50" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  sensorContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    width: "90%",
    alignItems: "center",
  },
  sensorTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  sensorText: { fontSize: 16, color: "#333", marginVertical: 2 },
  noSensorData: { marginTop: 20, fontSize: 16, color: "#777" },
});

export default DashboardSection;
