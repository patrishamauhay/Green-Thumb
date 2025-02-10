import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function UserPlantDetails({ route, navigation }) {
  const { plantId, docId } = route.params;
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
          } else {
            Alert.alert('Error', 'Plant not found.');
            navigation.goBack();
          }
          setLoading(false);
        });

      return unsubscribe;
    }
  }, [userId, plantId]);

  const handleDelete = async () => {
    Alert.alert('Delete Plant', 'Are you sure you want to remove this plant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await firestore()
            .collection('users')
            .doc(userId)
            .collection('myGarden')
            .doc(docId)
            .delete();
          navigation.goBack();
        },
      },
    ]);
  };

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
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Plant Image */}
      {plant.imageUrl && <Image source={{ uri: plant.imageUrl }} style={styles.image} />}

      {/* Plant Name & Custom User Name */}
      <Text style={styles.plantName}>{plant.commonName}</Text>
      <Text style={styles.userPlantName}>{plant.userPlantName || 'Unnamed Plant'}</Text>

      {/* Water & Sunlight Information */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Icon name="water-outline" size={24} color="#2196F3" />
          <Text style={styles.infoText}>{plant.watering || 'Unknown'}</Text>
          <Text style={styles.infoLabel}>Water</Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="sunny-outline" size={24} color="#FF9800" />
          <Text style={styles.infoText}>{plant.sunlight || 'Unknown'}</Text>
          <Text style={styles.infoLabel}>Sunlight</Text>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Plant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#f5f5f5' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },

  image: { width: 150, height: 150, borderRadius: 8, marginTop: 50 },

  plantName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  userPlantName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    backgroundColor: '#E3E3E3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },

  infoBox: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },

  infoText: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  infoLabel: { fontSize: 14, color: '#666' },

  deleteButton: {
    marginTop: 30,
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
  },

  deleteText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
