import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CareSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Care Content</Text>
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

export default CareSection;
