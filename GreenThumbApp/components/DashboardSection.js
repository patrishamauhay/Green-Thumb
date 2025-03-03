import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  Dimensions,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Circle as ProgressCircle } from "react-native-progress";

const DashboardSection = ({ plantId, docId }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId || !docId) return;

    const userRef = firestore().collection("users").doc(userId);
    const plantRef = userRef.collection("myGarden").doc(docId);

    const unsubscribe = plantRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setIsActivated(data.Activated || false);

        if (data.latestSensorData) {
          setSensorData(data.latestSensorData);
        }
      }
    });

    return () => unsubscribe();
  }, [userId, docId]);

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
        await userRef.update({ activeSensorPlant: null, activeSensorUser: null });
        await plantRef.update({ Activated: false });
        setIsActivated(false);
      } else {
        console.log(`✅ Activating plant: ${docId}`);
        if (currentlyActivePlant) {
          const previousPlantRef = userRef.collection("myGarden").doc(currentlyActivePlant);
          await previousPlantRef.update({ Activated: false });
        }

        await userRef.update({ activeSensorPlant: docId, activeSensorUser: userId });
        await plantRef.update({ Activated: true });
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

      {/* Main Wrapper for Sensor Data & Toggle */}
      <View style={styles.mainContainer}>
        {/* Progress Circle Container (2/3 width) */}
        <View style={styles.progressContainer}>
          <ProgressCircle
            percent={sensorData?.["Soil Moisture"] || 0}
            radius={60}
            borderWidth={8}
            color="#4CAF50"
            shadowColor="#ddd"
            bgColor="#fff"
          />
          <Text style={styles.progressText}>
            {sensorData?.["Soil Moisture"]?.toFixed(1) || "0"}%
          </Text>
          <Text style={styles.labelText}>Soil Moisture</Text>
        </View>

        {/* Toggle Switch Container (1/3 width) */}
        <View style={styles.toggleContainer}>
          <Switch
            value={isActivated}
            onValueChange={toggleActivation}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={isActivated ? "#FFF" : "#f4f3f4"}
          />
          <Text style={styles.toggleText}>
            {isActivated ? "Activated" : "Deactivated"}
          </Text>

          {/* Display Last Updated Time */}
          {sensorData && (
            <Text style={styles.timestampText}>
              Last Updated: {new Date(sensorData.timestamp?.toDate()).toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  errorText: { color: "red", fontWeight: "bold", marginBottom: 10 },
  statusText: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },

  // Main Sensor Container (Row Layout with 2/3 and 1/3 split)
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width * 0.9, // Takes 90% of screen width
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  // Progress Circle Section (Takes 2/3 of the width)
  progressContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  labelText: { fontSize: 14, color: "#666", marginTop: 5 },

  // Toggle Switch Section (Takes 1/3 of the width)
  toggleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  timestampText: { marginTop: 10, fontSize: 13, color: "#666", textAlign: "center" },
});

export default DashboardSection;
