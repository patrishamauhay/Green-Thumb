import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import WaterLevelChart from '../components/WaterLevelChart';

const { width, height } = Dimensions.get("window");

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [myGarden, setMyGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (userId) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
          const plantList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMyGarden(plantList);
          setLoading(false);
        });
      return unsubscribe;
    }
  }, [userId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image 
          source={require("../assets/images/Home_Background.png")}  
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Gardener'}!</Text>
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => navigation.navigate('Search')} 
        >
          <Icon name="magnify" size={24} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for plants...</Text>
        </TouchableOpacity>
      </View>

      {/* My Garden Section */}
      <View style={styles.gardenContainer}>
        <Text style={styles.sectionTitle}>🌿 My Garden</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : myGarden.length === 0 ? (
          <Text style={styles.noPlantsText}>No plants added yet!</Text>
        ) : (
          <FlatList
            data={myGarden.slice(0, 4)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.plantCard}
                onPress={() =>
                  navigation.navigate('UserPlantDetails', { plantId: item.plantId, docId: item.id })
                }
              >
                <ImageBackground 
                  source={{ uri: item.imageUrl }} 
                  style={styles.imageBackground} 
                  imageStyle={{ borderRadius: 10 }}
                >
                  <View style={styles.nameOverlay}>
                    <Text style={styles.plantName}>{item.userPlantName || 'Unnamed Plant'}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      
      {/* Water Tank Level Section */}
      <View style={styles.waterContainer}>
        <Text style={styles.sectionTitle}>Water Tank Level</Text>
        <WaterLevelChart value={75} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    width: width,
    height: height * 0.35,
  },
  welcomeText: {
    position: 'absolute',
    top: '6%',
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 130,
  },
  searchBarContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '90%',
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  gardenContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: 16,
    elevation: 2,
  },
  waterContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: 16,
    elevation: 2,
  },
  quickAccessContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    marginHorizontal: 16,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  noPlantsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  plantCard: {
    width: 100, 
    height: 110, 
    borderRadius: 10,
    marginRight: 10,
    elevation: 3,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nameOverlay: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 5,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  plantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
