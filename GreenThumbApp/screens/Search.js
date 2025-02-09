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
      const results = await fetchPlants(''); // Fetch all plants
      const sortedPlants = results.sort((a, b) => a.common_name.localeCompare(b.common_name));
      setPlants(sortedPlants);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch search results in real-time as the user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        fetchAllPlants(); // Show all plants when input is empty
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
    }, 500); // Debounce search by 500ms to prevent excessive API calls

    return () => clearTimeout(delayDebounceFn); // Cleanup function to avoid multiple requests
  }, [searchQuery]); // Runs every time searchQuery changes

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PlantDetails', { plantId: item.id })}
    >
      {item.default_image && (
        <Image source={{ uri: item.default_image.original_url }} style={styles.image} />
      )}
      <View>
        <Text style={styles.name}>{item.common_name || 'Unknown Plant'}</Text>
        <Text style={styles.scientific}>{item.scientific_name?.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a plant..."
        value={searchQuery}
        onChangeText={setSearchQuery} // Updates the state immediately
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlantItem}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No plants found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  searchBar: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  image: { width: 60, height: 60, marginRight: 12, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  scientific: { fontSize: 14, color: '#555' },
  emptyMessage: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});
