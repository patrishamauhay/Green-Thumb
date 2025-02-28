import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import { colors } from '../constants/theme'; // Import theme colors

const { height, width } = Dimensions.get('screen');
const sections = ['Notes', 'Care', 'Metrics', 'Plant Info'];

export default function UserPlantDetails({ route, navigation }) {
  const { plantId, docId } = route.params;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (userId && plantId) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(docId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setPlant(doc.data());
          } else {
            Alert.alert('Error', 'Plant not found.');
            navigation.goBack();
          }
          setLoading(false);
        });
      return unsubscribe;
    }
  }, [userId, plantId]);

  const handleSectionChange = (index) => {
    setActiveSection(index);
    Animated.spring(translateX, {
      toValue: -index * width,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading plant details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Plant Image */}
      {plant?.imageUrl && <Image source={{ uri: plant.imageUrl }} style={styles.image} />}

      {/* Plant Info Section with Tabs */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.infoSection}
      >
        <Text style={styles.plantName}>{plant.userPlantName || 'Unnamed Plant'}</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity key={index} onPress={() => handleSectionChange(index)}>
            <Text style={[
              styles.tabText,
              activeSection === index ? styles.activeTabText : null,
            ]}>{section}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sliding Sections */}
      <Animated.View style={[styles.sectionContainer, { transform: [{ translateX }] }]}>
        <View style={styles.section}><Text style={styles.sectionText}>Notes Content</Text></View>
        <View style={styles.section}><Text style={styles.sectionText}>Care Content</Text></View>
        <View style={styles.section}><Text style={styles.sectionText}>Metrics Content</Text></View>
        <View style={styles.section}><Text style={styles.sectionText}>Plant Info Content</Text></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  image: { width: '100%', height: '25%' },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  plantName: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#1e1e1e',
  },
  tabText: {
    fontSize: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoContainer: {
    borderBottomColor: 'white',
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
    width: width * 4,
  },
  section: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sectionText: { fontSize: 18, color: 'white' },
});
