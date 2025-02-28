import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotesSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notes Content</Text>
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

export default NotesSection;
