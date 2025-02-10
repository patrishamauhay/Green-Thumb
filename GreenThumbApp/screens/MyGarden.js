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
      <View>
        <Text style={styles.name}>{item.userPlantName || 'Unnamed Plant'}</Text>
        <Text style={styles.scientific}>{item.commonName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList data={plants} keyExtractor={(item) => item.id} renderItem={renderPlantItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
  image: { width: 60, height: 60, marginRight: 12, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  scientific: { fontSize: 14, color: '#555' },
});
