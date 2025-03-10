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
import Svg, { Path, Text as SvgText } from "react-native-svg";
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

      {/* First Row: Soil Moisture + Toggle Switch */}
      <View style={styles.rowContainer}>
        {/* Soil Moisture Card */}
        <View style={styles.card}>
          <Text style={styles.labelTitle}>Soil Moisture</Text>
          <View style={styles.progressContainer}>
            <Svg width={140} height={80} viewBox="0 0 140 80">
              <Path
                d="M 10,70 A 50,50 0 0,1 130,70"
                fill="none"
                stroke="#ddd"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <Path
                d="M 10,70 A 50,50 0 0,1 130,70"
                fill="none"
                stroke={arcColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 180}, 200`}
              />
              <SvgText x="70" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
                {percentage.toFixed(1)}%
              </SvgText>
              <SvgText x="10" y="78" textAnchor="middle" fontSize="12" fill="#555">
                0
              </SvgText>
              <SvgText x="130" y="78" textAnchor="middle" fontSize="12" fill="#555">
                100
              </SvgText>
            </Svg>
          </View>
        </View>

        {/* Toggle Switch Card */}
        <View style={styles.switchCard}>
          <Switch
            value={isActivated}
            onValueChange={toggleActivation}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={isActivated ? "#FFF" : "#f4f3f4"}
          />
          <Text style={styles.toggleText}>
            {isActivated ? "Activated" : "Deactivated"}
          </Text>
        </View>
      </View>

      {/* Second Row: Moisture History Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.labelTitle}>Moisture Levels Over Time</Text>
        {moistureHistory.length > 0 ? (
          <LineChart
            data={{
              labels: moistureHistory.map((_, index) => `T${index + 1}`),
              datasets: [
                {
                  data: moistureHistory.map(entry => entry.value),
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
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noDataText}>No moisture data available</Text>
        )}
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingLeft: 20, // Pushes content to the right
    alignItems: "flex-end", // Align items to the right
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Moves content to the right
    alignItems: "center",
    width: width * 0.9,
    marginLeft: 20, // Push content right
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
    marginLeft: 20, // Push this card right
  },
  switchCard: {
    width: width * 0.3,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 20, // Push switch card right
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
    marginLeft: 20, // Push chart right
  },
});


export default DashboardSection;
