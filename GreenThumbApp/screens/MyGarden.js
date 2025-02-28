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
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text style={styles.name}>{item.userPlantName || 'Unnamed Plant'}</Text>
      <Text style={[styles.scientific, { fontSize: 10 }]}>{item.commonName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="leaf" size={28} color="#2E7D32" /> 
          <Text style={styles.title}> My Garden</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
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
          numColumns={2}
          columnWrapperStyle={styles.row} 
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

  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    marginLeft: 8,
  },

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

  row: { 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },

  card: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  image: { 
    width: 90, 
    height: 90, 
    borderRadius: 8, 
    marginBottom: 10 
  },

  name: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },

  scientific: { 
    fontSize: 14, 
    color: '#555', 
    textAlign: 'center', 
    marginBottom: 5 
  },


});
