
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getUserFavoritesRef } from '../config/firebaseConfig';
import auth from '@react-native-firebase/auth';

export default function MyGarden({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const unsubscribe = getUserFavoritesRef(userId).onSnapshot((snapshot) => {
        setFavorites(snapshot.docs.map((doc) => doc.data()));
      });
      return unsubscribe;
    }
  }, [userId]);

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PlantDetails', { plantId: item.id })}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
      <Text style={styles.name}>{item.common_name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>
      <FlatList data={favorites} keyExtractor={(item) => item.id.toString()} renderItem={renderPlantItem} />
    </View>
  );
}

