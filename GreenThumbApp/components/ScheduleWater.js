import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleWater({ onScheduleSet }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    loadScheduledTime();
  }, []);

  const loadScheduledTime = async () => {
    try {
      const storedTime = await AsyncStorage.getItem('scheduledTime');
      if (storedTime) {
        setScheduledTime(new Date(storedTime));
        setIsScheduled(true);
      }
    } catch (error) {
      console.error('Failed to load scheduled time', error);
    }
  };

  // Handle Date Selection
  const handleDateConfirm = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return; // Cancel if dismissed
    }

    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  // Handle Time Selection
  const handleTimeConfirm = async (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return; // Cancel if dismissed
    }

    setShowTimePicker(false);
    if (selectedTime) {
      const combinedDate = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

      setScheduledTime(combinedDate);
      setIsScheduled(true);

      try {
        await AsyncStorage.setItem('scheduledTime', combinedDate.toISOString());
        Alert.alert('Schedule Set', `Plant will be watered at ${combinedDate.toLocaleString()}`);
        onScheduleSet(combinedDate);
      } catch (error) {
        console.error('Failed to save schedule', error);
      }
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  const renderPickers = () => (
    <>
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateConfirm} // Handle cancel here
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeConfirm} // Handle cancel here
        />
      )}
    </>
  );

  return (
    <>
      {/* Display Next Scheduled Time */}
      <Text style={styles.statusText}>
        {isScheduled
          ? `Next watering: ${formatDateTime(scheduledTime)}`
          : 'No schedule set'}
      </Text>

      {/* Schedule Button */}
      <TouchableOpacity 
        style={styles.scheduleButton}
        onPress={openDatePicker}
      >
        <Text style={styles.buttonText}>
          {isScheduled ? "RESCHEDULE WATERING" : "SCHEDULE WATERING"}
        </Text>
      </TouchableOpacity>

      {/* Date and Time Picker */}
      {renderPickers()}
    </>
  );
}

const styles = StyleSheet.create({
  statusText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },

  scheduleButton: {
    width: '80%', // Same width as other buttons
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15, // Same margin
    borderWidth: 2,
    borderColor: '#fff',
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
