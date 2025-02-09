import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fetchPlants } from '../api/plants';
import Icon from 'react-native-vector-icons/Ionicons'; // For icons
import LinearGradient from 'react-native-linear-gradient'; // For gradient background

export default function Search({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllPlants();
  }, []);

  // Fetch all plants when the screen loads
  const fetchAllPlants = async () => {
    setIsLoading(true);
    try {
      const results = await fetchPlants('');
      const sortedPlants = results.sort((a, b) => a.common_name.localeCompare(b.common_name));
      setPlants(sortedPlants);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        fetchAllPlants();
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchPlants(searchQuery);
        const sortedResults = results.sort((a, b) => a.common_name.localeCompare(b.common_name));
        setPlants(sortedResults);
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlantDetails', { plantId: item.id })}
    >
      {item.default_image && (
        <Image source={{ uri: item.default_image.original_url }} style={styles.image} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.common_name || 'Unknown Plant'}</Text>
        <Text style={styles.scientific}>{item.scientific_name?.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#E3F2FD', '#C8E6C9']} style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a plant..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#388E3C" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlantItem}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No plants found.</Text>}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 8 },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: 60, height: 60, marginRight: 12, borderRadius: 10 },
  textContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  scientific: { fontSize: 14, color: '#666' },
  loadingIndicator: { marginTop: 20 },
  emptyMessage: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
});
