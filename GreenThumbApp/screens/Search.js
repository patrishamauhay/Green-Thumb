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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPlants } from '../api/plants';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Search({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Controls the highlight

  useEffect(() => {
    fetchAllPlants();
    loadRecentSearches(); // Load recent searches on start
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

  // Save search queries to AsyncStorage
  const saveSearch = async (query) => {
    if (!query) return;
    let searches = JSON.parse(await AsyncStorage.getItem('recentSearches')) || [];
    if (!searches.includes(query)) {
      searches.unshift(query);
      if (searches.length > 5) searches.pop(); // Keep last 5 searches
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
    }
    loadRecentSearches();
  };

  // Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    const searches = JSON.parse(await AsyncStorage.getItem('recentSearches')) || [];
    setRecentSearches(searches);
  };

  // Perform search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        fetchAllPlants();
        return;
      }
      setIsLoading(true);
      try {
        const results = await fetchPlants(searchQuery);
        const filteredResults = results.filter((plant) => plant.default_image);
        const sortedResults = filteredResults.sort((a, b) => a.common_name.localeCompare(b.common_name));
        setPlants(sortedResults);
        saveSearch(searchQuery); // Save search term
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderPlantItem = ({ item, index }) => (
    <View>
      {index === 0 && <View style={styles.separator} />}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PlantDetails', { plantId: item.id })}
      >
        <Image source={{ uri: item.default_image.original_url }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.common_name || 'Unknown Plant'}</Text>
          <Text style={styles.scientific}>{item.scientific_name?.join(', ')}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={18} color="#999" />
      </TouchableOpacity>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBarContainer, isFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search plants"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <View style={styles.recentSearchList}>
            {recentSearches.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchButton}
                onPress={() => setSearchQuery(query)}
              >
                <Text style={styles.recentSearchText}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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

  searchBarFocused: {
    borderColor: '#4CAF50', // Green highlight
    borderWidth: 2,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  recentSearchesContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  recentSearchList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  recentSearchButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 5,
  },

  recentSearchText: {
    color: '#333',
    fontSize: 14,
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
    borderRadius: 10,
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
