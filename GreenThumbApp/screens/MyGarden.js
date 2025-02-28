import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/theme'; 

export default function MyGarden({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth().currentUser?.uid;

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
          setPlants(plantList);
          setLoading(false);
        });

      return unsubscribe;
    }
  }, [userId]);

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('UserPlantDetails', { plantId: item.plantId, docId: item.id })
      }
    >
      {/* Plant Image */}
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}

      {/* Plant Info */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.userPlantName || 'Unnamed Plant'}</Text>
        <Text style={styles.scientific}>{item.commonName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <Ionicons name="leaf" size={28} color="#FFF" /> 
          <Text style={styles.title}> My Garden</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : plants.length === 0 ? (
        <View style={styles.noPlantsContainer}>
          <Text style={styles.noPlantsText}>No plants added yet!</Text>
          <Text style={styles.noPlantsSubtext}>Start growing your garden by adding new plants.</Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={renderPlantItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  /* Header */
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 2,
    width: '100%', 
    height: '10%',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FFFFFF',
  },

  /* Empty State */
  noPlantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  noPlantsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },

  noPlantsSubtext: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },  

  /* List Layout */
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  /* Plant Item Card */
  /* Plant Item Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15, 
    marginVertical: 12,
    marginHorizontal: 10,
    minHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },


  /* Plant Image */
  image: { 
    width: 100, 
    height: 100, 
    borderRadius: 10, 
    marginRight: 12,
  },

  /* Text Container */
  textContainer: {
    flex: 1,
  },

  name: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333',
  },

  scientific: { 
    fontSize: 16, 
    color: '#777', 
  },

});

