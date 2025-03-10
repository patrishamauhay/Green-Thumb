import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { fetchCareGuide } from '../api/plant';

const CareSection = ({ speciesId }) => {
  const [careData, setCareData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCareGuide = async () => {
      try {
        console.log(`Fetching care guide for species ID: ${speciesId}`);
        const data = await fetchCareGuide(speciesId);
        console.log('API Response:', data);

        // ✅ Update state with the care data
        setCareData(data || []);
      } catch (error) {
        console.error('Failed to load care guide:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!speciesId) {
      console.warn('No species ID provided');
      setLoading(false);
      return;
    }

    getCareGuide();
  }, [speciesId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.careCard}>
        {/* ✅ Title */}
        <Text style={styles.title}>How-to</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : careData.length > 0 ? (
          careData.map((item, index) => (
            <View key={index} style={styles.card}>
              {/* ✅ Display Type */}
              <Text style={styles.label}>{item.type?.toUpperCase()}</Text>

              {/* ✅ Display Description */}
              <Text style={styles.description}>
                {item.description || 'No description available'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No care data available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'left',
    marginLeft: 15, // ✅ Left-align title
  },
  card: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  careCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20, // ✅ Added padding for better structure
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default CareSection;
