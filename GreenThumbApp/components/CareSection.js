import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchCareGuide } from '../api/plants';

const CareSection = ({ speciesId }) => {
  const [careData, setCareData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCareGuide = async () => {
      try {
        const data = await fetchCareGuide(speciesId);
        setCareData(data);
      } catch (err) {
        console.error('Error loading care guide:', err);
      } finally {
        setLoading(false);
      }
    };

    if (speciesId) loadCareGuide();
  }, [speciesId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />;
  }

  return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
              <View style={styles.card}>
        <Text style={styles.title}>How-to Care</Text>
        {careData.length === 0 ? (
          <Text style={styles.noDataText}>No care data available</Text>
        ) : (
          careData.map((item) => (
            <View key={item.id} style={styles.guideItem}>
              <Text style={styles.guideTitle}>{capitalize(item.type)}</Text>
              <Text style={styles.guideText}>{item.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// Capitalize helper
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

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
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginBottom: 10,
  },
  guideItem: {
    marginBottom: 20,
  },
  guideTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    color: '#4CAF50',
  },
  guideText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default CareSection;
