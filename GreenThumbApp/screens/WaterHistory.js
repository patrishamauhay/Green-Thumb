import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';

export default function WaterHistory({ navigation }) {
  const [user, setUser] = useState(null);
  const [wateringHistory, setWateringHistory] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadWateringHistory();
  }, []);

  const loadWateringHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('wateringHistory');
      if (storedHistory) {
        setWateringHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load watering history', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getChartData = () => {
    const dayCounts = {};
  
    wateringHistory.forEach((entry) => {
      const datePart = entry.split(',')[0].trim(); // Use the exact saved date text
      dayCounts[datePart] = (dayCounts[datePart] || 0) + 1;
    });
  
    const sortedDates = Object.keys(dayCounts);
  
    // No parsing, just use date strings
    const labels = sortedDates.map(date => {
      const parts = date.split('/'); // "4/28/2025" -> ["4", "28", "2025"]
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}`; // just show MM/DD
      }
      return date; // fallback
    });
  
    const data = sortedDates.map(date => dayCounts[date]);
  
    return { labels, data };
  };
  

  const chartData = getChartData();
  const mostRecentSession = wateringHistory.length > 0 ? wateringHistory[0] : "No history available.";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="grey" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watering History</Text>
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Watering Frequency Chart */}
      {chartData.labels.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Watering Frequency Chart</Text>
          <View style={styles.chartBox}>
            <BarChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.data }],
              }}
              width={300}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(46, 111, 64, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.6,
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              style={styles.chartStyle}
            />
          </View>
        </View>
      )}

      {/* Recent Watering Session */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Recent Watering Session</Text>
        <View style={styles.historyItemContainer}>
          <Text style={styles.historyItemText}>{mostRecentSession}</Text>
        </View>

        {/* Dropdown Button */}
        {wateringHistory.length > 1 && (
          <TouchableOpacity onPress={() => setIsDropdownOpen(!isDropdownOpen)} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>
              {isDropdownOpen ? "Hide Older Sessions" : "View Older Sessions"}
            </Text>
            <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#2E6F40" />
          </TouchableOpacity>
        )}

        {/* Older Watering Sessions */}
        {isDropdownOpen && wateringHistory.length > 1 && (
          <FlatList
            data={wateringHistory.slice(1)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItemContainer}>
                <Text style={styles.historyItemText}>{item}</Text>
              </View>
            )}
            nestedScrollEnabled={true}
            style={styles.flatList}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
  chartBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  chartStyle: {
    borderRadius: 16,
  },
  historyContainer: {
    backgroundColor: '#E3E3E3',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#E3E3E3',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E6F40',
    marginBottom: 10,
  },
  historyItemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  historyItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#D3D3D3',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'space-between',
    width: '100%',
  },
  dropdownText: {
    fontSize: 16,
    color: '#2E6F40',
    marginRight: 5,
  },
  flatList: {
    width: '100%',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
  },
});
