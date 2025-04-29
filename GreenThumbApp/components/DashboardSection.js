import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Alert, Dimensions } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
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

  let arcColor = "#D32F2F"; // Default red
  if (percentage > 80) arcColor = "#4CAF50"; // Green
  else if (percentage >= 30 && percentage <= 80) arcColor = "#FFC107"; // Orange

  return (
    <View style={styles.container}>
      {errorMessage && <Text style={styles.errorText}>⚠️ {errorMessage}</Text>}

      <View style={styles.rowContainer}>
        {/* Soil Moisture Card */}
        <View style={styles.card}>
          <Text style={styles.labelTitle}>Soil Moisture</Text>
          <View style={styles.progressContainer}>
            <Svg width={120} height={120}>
              {/* Background Circle */}
              <Circle
                cx="60"
                cy="60"
                r="50"
                stroke="#E0E0E0"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx="70"
                cy="70"
                r="60"
                stroke={arcColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - percentage / 100)}
                strokeLinecap="round"
                rotation="-90"
                origin="70,70"
              />
              {/* Percentage Text */}
              <SvgText
                x="60"
                y="65"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill={arcColor}
              >
                {percentage.toFixed(1)}%
              </SvgText>
            </Svg>

            {/* Status Text */}
            <Text style={[styles.statusText, { color: arcColor }]}>
              {percentage < 30
                ? "🟥 Low"
                : percentage <= 80
                ? "🟧 Moderate"
                : "🟩 Good"}
            </Text>
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
          <Text style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: "600",
            color: isActivated ? "#4CAF50" : "#888",
          }}>
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
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
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
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    height: 210,
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
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  switchCard: {
    width: width * 0.3,
    height: 130,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
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
