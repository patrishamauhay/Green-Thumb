import React from 'react';
import { View, StyleSheet } from 'react-native';

const Separator = ({ color = '#000000', width = '90%', marginBottom = 15, height = 1, style }) => {
  return <View style={[styles.separator, { backgroundColor: color, width, marginBottom, height }, style]} />;
};

const styles = StyleSheet.create({
  separator: {
    alignSelf: 'center',
  },
});

export default Separator;
