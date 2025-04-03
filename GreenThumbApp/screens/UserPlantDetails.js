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
import LinearGradient from 'react-native-linear-gradient';
import PlantInfoSection from '../components/PlantInfoSection';
import NotesSection from '../components/NotesSection';
import DashboardSection from '../components/DashboardSection';
import CareSection from '../components/CareSection';


import { colors } from '../constants/theme'; 

const { height, width } = Dimensions.get('screen');
const sections = ['Dashboard', 'Care','Plant Info', 'Notes'];

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
<View>
        <Text style={styles.plantName}>
          {plant.userPlantName || 'Unnamed Plant'}
        </Text>
        <Text style={styles.speciesName}>
          {plant.commonName || 'Unknown Species'}
        </Text>
      </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Gradient Tabs */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tabContainer}
      >
        {sections.map((section, index) => (
          <TouchableOpacity key={index} onPress={() => handleSectionChange(index)}>
            <Text style={[
              styles.tabText,
              activeSection === index ? styles.activeTabText : null,
            ]}>{section}</Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>

      <Animated.View style={[styles.sectionContainer, { transform: [{ translateX }] }]}>
    <View style={styles.section}>
      <DashboardSection plantId={plantId} docId={docId} />
    </View>
    <View style={styles.section}>
    <CareSection speciesId={plant.plantId} />
    </View>
    <View style={styles.section}>
      <PlantInfoSection plant={plant} />
    </View>
    <View style={styles.section}>
      <NotesSection plantId={plantId} />
    </View>
  </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    zIndex: 10, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 5,
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  image: { width: '100%', height: '25%' },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  plantName: { fontSize: 25, color: 'white', fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: 'white',
    paddingVertical: 8,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  sectionContainer: {
    flexDirection: 'row',
    width: width * 4,
    height: '100%',
  },
  section: {
    width: width,
    height: height - 350,
  },
  sectionText: { fontSize: 18, color: 'darkgrey' },
  speciesName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'white',
    opacity: 0.85,
    marginTop: 2,
  },
  
});
