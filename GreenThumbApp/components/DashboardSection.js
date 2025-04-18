/**
 * DashboardSection Component
 * 
 * This component displays a real-time overview of a plant's sensor data.
 * It shows current soil moisture with a visual gauge, a history line chart,
 * and allows the user to toggle activation of live sensor streaming and control.
 * It uses Firebase Firestore for data syncing and MQTT logic tied to the "Activated" state.
 */

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
import Svg, { Path, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { LineChart } from "react-native-chart-kit";


const DashboardSection = ({ plantId, docId }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [moistureHistory, setMoistureHistory] = useState([]);
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

        if (Array.isArray(data.sensorHistory)) {
          const validHistory = data.sensorHistory
            .filter(entry => Number.isFinite(entry.value))
            .map(entry => ({ time: entry.time || "", value: entry.value }));

          setMoistureHistory(validHistory);
        } else {
          setMoistureHistory([]);
        }
      }
    });

    return () => unsubscribe();
  }, [userId, docId]);

  const toggleActivation = async () => {
    if (!userId || !docId) {
      console.log("Toggling activation...");
      setErrorMessage("Missing userId or plantId.");
      return;
    }

    const userRef = firestore().collection("users").doc(userId);
    const plantRef = userRef.collection("myGarden").doc(docId);

    try {
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({ activeSensorPlant: null, activeSensorUser: null }, { merge: true });
      }

      const currentlyActivePlant = userDoc.data()?.activeSensorPlant || null;

      if (currentlyActivePlant === docId) {
        await userRef.update({ activeSensorPlant: null, activeSensorUser: null });
        await plantRef.update({ Activated: false });
        setIsActivated(false);
      } else {
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
      console.error("Toggle activation Firestore error:", error);
      setErrorMessage("Failed to update activation.");
      Alert.alert("Error", "Could not update activation. Please try again.");
    }
  };

  const soilMoisture = sensorData?.["Soil Moisture"] || 0;
  const percentage = Math.min(100, Math.max(0, soilMoisture));

  let arcColor = "#D32F2F";
  if (percentage > 75) arcColor = "#4CAF50";
  else if (percentage >= 30 && percentage <= 75) arcColor = "#FFC107";

  return (
    <View style={styles.container}>
      {errorMessage && <Text style={styles.errorText}>⚠️ {errorMessage}</Text>}

      <View style={styles.rowContainer}>
        {/* Soil Moisture Card */}
        <View style={styles.card}>
          <Text style={styles.labelTitle}>Soil Moisture</Text>
          <View style={styles.progressContainer}>
            <Svg width={150} height={90} viewBox="0 0 150 90">
              {/* Background Arc */}
              <Path
                d="M 10,80 A 60,60 0 0,1 140,80"
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Gradient Arc */}
              <Defs>
                <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor={arcColor} stopOpacity="1" />
                  <Stop offset="100%" stopColor="#E0E0E0" stopOpacity="0.5" />
                </LinearGradient>
              </Defs>

              <Path
                d="M 10,80 A 60,60 0 0,1 140,80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 180}, 200`}
                strokeDashoffset="0"
              />

              {/* Percentage Text */}
              <SvgText
                x="75"
                y="50"
                textAnchor="middle"
                fontSize="18"
                fontWeight="bold"
                fill="#333"
              >
                {percentage.toFixed(1)}%
              </SvgText>

              {/* Min/Max Labels */}
              <SvgText x="10" y="85" textAnchor="middle" fontSize="12" fill="#777">
                0
              </SvgText>
              <SvgText x="140" y="85" textAnchor="middle" fontSize="12" fill="#777">
                100
              </SvgText>
            </Svg>
          </View>
        </View>

        {/* Toggle Switch Card */}
        <View style={styles.switchCard}>

          <Text style={styles.switchLabel}>Sensor Control</Text>

          <Switch
            value={isActivated}
            onValueChange={toggleActivation}
            trackColor={{ false: "#ddd", true: "#A5D6A7" }}
            thumbColor={isActivated ? "#4CAF50" : "#f4f4f4"}
            ios_backgroundColor="#ccc"
            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
          />

          <Text
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: "600",
              color: isActivated ? "#4CAF50" : "#888",
            }}
          >
            {isActivated ? "Activated" : "Deactivated"}
          </Text>
        </View>

                  </View>

              {/* Moisture History Chart */}
              <View style={styles.chartCard}>
                <Text style={styles.labelTitle}>Moisture Levels Over Time</Text>
                <LineChart
          data={{
            labels: moistureHistory.length > 0
              ? moistureHistory.map((_, index) => `T${index + 1}`)
              : ['T1', 'T2', 'T3', 'T4', 'T5'],
            datasets: [
              {
                data: moistureHistory.length > 0
                  ? moistureHistory.map(entry => entry.value)
                  : [0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // ✅ Define color function
                strokeWidth: 3,
              },
            ],
          }}
          width={width * 0.85}
          height={220}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // ✅ Define color function
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // ✅ Define labelColor function
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#4CAF50",
            },
          }}
          bezier
        />

      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.9,
  },
  card: {
    width: width * 0.55,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  }, 
switchCard: {
  width: width * 0.3,
  height: 130, // ⬅️ Reduced
  backgroundColor: "#fff",
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 10, // ⬅️ Less vertical padding
  paddingHorizontal: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 5,
  marginLeft: 10,
},
  chartCard: {
    marginTop: 20,
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default DashboardSection;
