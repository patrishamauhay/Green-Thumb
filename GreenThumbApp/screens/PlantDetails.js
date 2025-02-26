import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image, 
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { fetchPlantDetails } from '../api/plants';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function PlantDetails({ route, navigation }) {
  const { plantId } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customName, setCustomName] = useState('');

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

  const addToMyGarden = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'You need to be logged in to save plants.');
      return;
    }

    if (!customName.trim()) {
      Alert.alert('Error', 'Please enter a custom name for your plant.');
      return;
    }

    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .add({
          plantId: plant.id,
          commonName: plant.common_name || 'Unknown Plant',
          scientificName: plant.scientific_name?.join(', ') || 'Unknown',
          imageUrl: plant.default_image?.original_url || null,
          userPlantName: customName,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Success', 'Plant added to My Garden!');
      setCustomName('');
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Could not add plant to My Garden.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading plant details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

      {/* Top Header Section */}
      <View style={styles.headerContainer}>
        {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="grey" />
      </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={addToMyGarden}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Plant Info Section */}
      <View style={styles.topSection}>
        {/* Plant Image */}
        {plant.default_image && (
          <Image source={{ uri: plant.default_image.original_url }} style={styles.image} />
        )}

        {/* Name and Input Section */}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{plant.common_name || 'Unknown Plant'}</Text>
          <Text style={styles.scientific}>{plant.scientific_name?.join(', ') || 'No scientific name'}</Text>

          {/* Input Field */}
          <TextInput
            style={styles.input}
            placeholder="Name your plant"
            value={customName}
            onChangeText={setCustomName}
          />
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{plant.description || 'No description available.'}</Text>
      </View>
      
      {/* Separator */}
      <View style={styles.separator} />

      {/* Additional Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.info}>🌱 Cycle: {plant.cycle || 'Unknown'}</Text>
        <Text style={styles.info}>💧 Watering: {plant.watering || 'Unknown'}</Text>
        <Text style={styles.info}>❄️ Hardiness Zone: {plant.hardiness_zone || 'Unknown'}</Text>
        <Text style={styles.info}>☀️ Sunlight: {plant.sunlight?.join(', ') || 'Unknown'}</Text>
        <Text style={styles.info}>🌿 Growth Rate: {plant.growth_rate || 'Unknown'}</Text>
        <Text style={styles.info}>⚠️ Care Level: {plant.care_level || 'Unknown'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },

  /* Loading State */
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Header Section */
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  /* Back Button */
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#E3E3E3',
    marginRight: 10,
  },
  backText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },

  /* Save Button */
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Top Section */
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scientific: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 5,
  },

  /* Input */
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
  },

  /* Separator */
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    width: '90%',
    marginVertical: 20,
  },

  /* Sections */
  section: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },

  /* Additional Info */
  infoContainer: { width: '100%', paddingHorizontal: 16, marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 5 },
});
