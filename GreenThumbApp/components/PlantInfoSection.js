import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PlantInfoSection = ({ plantId, docId }) => {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (userId && plantId) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(docId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setPlant(doc.data());
          }
          setLoading(false);
        });

      return unsubscribe;
    }
  }, [userId, plantId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading plant information...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Plant details not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Plant Name */}
      <Text style={styles.name}>{plant.commonName || 'Unknown Plant'}</Text>
      <Text style={styles.scientific}>{plant.scientificName || 'No scientific name'}</Text>

      {/* Plant Image */}
      {plant.imageUrl && <Image source={{ uri: plant.imageUrl }} style={styles.image} />}

      {/* Description */}
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>{plant.description || 'No description available.'}</Text>

      {/* Additional Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.info}>🌱 Cycle: {plant.cycle || 'Unknown'}</Text>
        <Text style={styles.info}>💧 Watering: {plant.watering || 'Unknown'}</Text>
        <Text style={styles.info}>❄️ Hardiness Zone: {plant.hardiness_zone || 'Unknown'}</Text>
        <Text style={styles.info}>☀️ Sunlight: {plant.sunlight || 'Unknown'}</Text>
        <Text style={styles.info}>🌿 Growth Rate: {plant.growth_rate || 'Unknown'}</Text>
        <Text style={styles.info}>⚠️ Care Level: {plant.care_level || 'Unknown'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  scientific: { fontSize: 16, fontStyle: 'italic', color: '#555', marginBottom: 5 },
  image: { width: 120, height: 120, borderRadius: 10, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  infoContainer: { marginTop: 10, alignItems: 'center' },
  info: { fontSize: 16, marginBottom: 5 },
});

export default PlantInfoSection;
