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
import Icon from 'react-native-vector-icons/Ionicons';

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

      {/* Custom Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Give your plant a name..."
        value={customName}
        onChangeText={setCustomName}
      />

      {/* Add to My Garden Button */}
      <TouchableOpacity style={styles.addButton} onPress={addToMyGarden}>
        <Text style={styles.addText}>Add to My Garden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 200, height: 200, marginBottom: 20, borderRadius: 8 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  scientific: { fontSize: 18, fontStyle: 'italic', color: '#555', marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#ACADA8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  addText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
