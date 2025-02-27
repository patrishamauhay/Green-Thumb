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
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      const filteredPlants = results.filter((plant) => plant.default_image); // Only keep plants with images
      const sortedPlants = filteredPlants.sort((a, b) => a.common_name.localeCompare(b.common_name));
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
        const filteredResults = results.filter((plant) => plant.default_image); // Filter out plants without images
        const sortedResults = filteredResults.sort((a, b) => a.common_name.localeCompare(b.common_name));
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
    <View>
      <View style={styles.card}>
        <Image source={{ uri: item.default_image.original_url }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.common_name || 'Unknown Plant'}</Text>
          <Text style={styles.scientific}>{item.scientific_name?.join(', ')}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search plants"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Loading Indicator */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },

  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },

  scientific: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  loadingIndicator: {
    marginTop: 20,
  },

  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

