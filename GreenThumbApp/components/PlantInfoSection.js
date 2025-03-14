import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PlantInfoSection = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Plant Info</Text>
          <Text style={styles.noDataText}>No plant data available</Text>
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
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default PlantInfoSection;
