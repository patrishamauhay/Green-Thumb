import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const WaterLevelChart = ({ value = 75 }) => {
  const size = 140; // Size of the chart
  const strokeWidth = 14; // Thicker stroke for better look
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <View style={styles.chartContainer}>
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
          strokeDashoffset={progress}
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
  chartContainer: {
    alignItems: 'center', // Centers horizontally
    justifyContent: 'center', // Centers vertically
  },
});

export default WaterLevelChart;
