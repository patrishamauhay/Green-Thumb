import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchPlantDetails } from '../api/plants';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PlantDetails({ route, navigation }) {
  const { plantId } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlantDetails = async () => {
      try {
        const details = await fetchPlantDetails(plantId);
        setPlant(details);
      } catch (error) {
        console.error('Error fetching plant details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlantDetails();
  }, [plantId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading plant details...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Plant details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Plant Image */}
      {plant.default_image && (
        <Image source={{ uri: plant.default_image.original_url }} style={styles.image} />
      )}
      
      {/* Plant Details */}
      <Text style={styles.name}>{plant.common_name || 'Unknown Plant'}</Text>
      <Text style={styles.scientific}>
        {plant.scientific_name?.join(', ') || 'No scientific name'}
      </Text>
      <Text style={styles.info}>🌱 Cycle: {plant.cycle || 'Unknown'}</Text>
      <Text style={styles.info}>💧 Watering: {plant.watering || 'Unknown'}</Text>
      <Text style={styles.info}>☀️ Sunlight: {plant.sunlight?.join(', ') || 'Unknown'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 200, height: 200, marginBottom: 20, borderRadius: 8 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  scientific: { fontSize: 18, fontStyle: 'italic', color: '#555', marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },

  // Back Button Styling
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40, // Adjust for notch screens
    left: 20,
    backgroundColor: '#D3D3D3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
