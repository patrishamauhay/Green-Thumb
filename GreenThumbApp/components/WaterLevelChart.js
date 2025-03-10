import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const WaterLevelChart = ({ value = 75 }) => {
  const size = 120; // Size of the chart
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0" // Light grey background
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4CAF50" // Green progress color
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress} // Adjusted by value
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`} // Start from top
        />
        {/* Percentage Text */}
        <SvgText
          x={size / 2}
          y={size / 2 + 6}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#4CAF50"
        >
          {value}%
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WaterLevelChart;
