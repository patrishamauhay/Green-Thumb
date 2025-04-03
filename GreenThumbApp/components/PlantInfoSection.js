import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchPlantDetails } from '../api/plants';

export default function PlantInfoSection({ plant }) {
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        if (plant?.plantId) {
          const data = await fetchPlantDetails(plant.plantId);
          setSpecies(data);
        }
      } catch (err) {
        console.error('Error fetching species info:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSpecies();
  }, [plant]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />;
  }

  if (!species) {
    return <Text style={styles.noDataText}>No species data found.</Text>;
  }

  return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >

      <View style={styles.card}>
        <Text style={styles.title}>Description</Text>
        <Text style={styles.description}>
          {species.description || 'No description available.'}
        </Text>
      </View>

      <View style={styles.infoCard}>
      <Text style={styles.title}>Plant Details</Text>
        <Text style={styles.info}>🌱 Cycle: {species.cycle || 'Unknown'}</Text>
        <Text style={styles.info}>💧 Watering: {species.watering || 'Unknown'}</Text>
        <Text style={styles.info}>❄️ Hardiness Zone: {species.hardiness_zone || 'Unknown'}</Text>
        <Text style={styles.info}>☀️ Sunlight: {species.sunlight?.join(', ') || 'Unknown'}</Text>
        <Text style={styles.info}>🌿 Growth Rate: {species.growth_rate || 'Unknown'}</Text>
        <Text style={styles.info}>⚠️ Care Level: {species.care_level || 'Unknown'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
  },

  
});
