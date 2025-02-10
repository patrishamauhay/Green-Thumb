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
      onPress={() => navigation.navigate('PlantDetails', { plantId: item.plantId })}
    >
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text style={styles.name}>{item.userPlantName || 'Unnamed Plant'}</Text>
      <Text style={[styles.scientific, { fontSize: 10 }]}>
        {item.commonName}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>💧 {item.watering || 'Unknown'}</Text>
        <Text style={styles.infoText}>☀️ {item.sunlight || 'Unknown'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={renderPlantItem}
          numColumns={2} // Set grid layout (2 columns)
          columnWrapperStyle={styles.row} // Ensures spacing between columns
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  
  row: { 
    justifyContent: 'space-between', 
    marginBottom: 10 
  }, // Space between grid items
  
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
  
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  scientific: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 5 },

  infoContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  infoText: { fontSize: 12, color: '#666' },
});
