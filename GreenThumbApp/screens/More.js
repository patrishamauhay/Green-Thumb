import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import SettingsDrawer from '../components/SettingsDrawer';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/theme';

export default function More({ navigation }) {
  const [user, setUser] = useState(null);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('screen').height)).current;

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const openDrawer = () => Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  const closeDrawer = () => Animated.timing(slideAnim, { toValue: Dimensions.get('screen').height, duration: 300, useNativeDriver: false }).start();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="settings-outline" size={28} color="#FFFFFF" style={styles.iconRight} />
        </TouchableOpacity>
        <Text style={styles.title}>More Actions</Text>
      </LinearGradient>

      {/* Widgets Section */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.widgetsContainer}>
          <TouchableOpacity 
            style={styles.widget} 
            onPress={() => navigation.navigate('Sensor')}
          >
            <Ionicons name="wifi-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Sensors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.widget}>
            <Ionicons name="alarm-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Set Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.widget}>
            <Ionicons name="water-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Water Tank</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.widget}>
            <Ionicons name="bulb-outline" size={40} color="#FFFFFF" />
            <Text style={styles.widgetText}>Light Meter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SettingsDrawer slideAnim={slideAnim} closeDrawer={closeDrawer} user={user} handleLogout={handleLogout} />
    </View>
  );
}

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 2,
    width: '100%', 
    height: '10%'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  iconLeft: {
    marginRight: 10,
  },
  content: {
    paddingHorizontal: 20,
  },
  widgetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  widget: {
    width: width * 0.4,
    backgroundColor: '#179b9e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  widgetText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
