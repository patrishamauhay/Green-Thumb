import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get("window");


export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [waterTankLevel, setWaterTankLevel] = useState(12); // Example data
  const [myGarden, setMyGarden] = useState([
    { name: 'Fern', humidity: '27%', sunlight: '80%' },
    { name: 'Rose', humidity: '40%', sunlight: '50%' },
  ]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login'); // Redirect to login after logout
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.container}>
        <Image 
        source={require("../assets/images/Home_Background.png")}  
        style={styles.backgroundImage} 
        resizeMode="cover"
      />
      <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Gardener'} !</Text>
      </View>

      {/* My Garden Section */}
      {/*
      <View style={styles.gardenContainer}>
        <Text style={styles.sectionTitle}>🌿 My Garden</Text>
        <View style={styles.plantList}>
          {myGarden.map((plant, index) => (
            <View key={index} style={styles.plantCard}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantInfo}>💧 {plant.humidity}</Text>
              <Text style={styles.plantInfo}>☀️ {plant.sunlight}</Text>
            </View>
          ))}
        </View>
      </View>

       Quick Access Buttons 
      <View style={styles.quickAccessContainer}>
        <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
        <View style={styles.quickButtons}>
          <TouchableOpacity style={styles.quickButton}>
            <Icon name="water" size={30} color="white" />
            <Text style={styles.quickButtonText}>Water Tank</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <Icon name="weather-cloudy" size={30} color="white" />
            <Text style={styles.quickButtonText}>Climate Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <Icon name="watering-can" size={30} color="white" />
            <Text style={styles.quickButtonText}>Water</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <Icon name="dots-horizontal" size={30} color="white" />
            <Text style={styles.quickButtonText}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
*/}
      {/* Floating Add Button 
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('AddPlant')}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
*/}
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: height * 0.35,
    position: "absolute",
    top: 0,
    left: 0,
  },
  container: {
    flexGrow: 1,
    //padding: 16,
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 5,
    padding: 17,
    color: '#FFFFFF',
  },

  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  alertContainer: {
    backgroundColor: '#FFCDD2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  alertText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gardenContainer: {
    backgroundColor: '#8ABD91',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  plantList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  plantCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  plantInfo: {
    fontSize: 14,
    color: '#555',
  },
  quickAccessContainer: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    width: '22%',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  floatingButton: {
    backgroundColor: '#388E3C',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,

  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
