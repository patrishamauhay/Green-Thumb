import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlantInfoSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Plant Info</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: { fontSize: 18, color: 'darkgrey' },
});

export default PlantInfoSection;
