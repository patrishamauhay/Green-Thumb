import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get("window");

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image 
          source={require("../assets/images/Home_Background.png")}  
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
        <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Gardener'}!</Text>
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => navigation.navigate('Search')} 
        >
          <Icon name="magnify" size={24} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for plants...</Text>
        </TouchableOpacity>
      </View>

      {/* My Garden Section 
            <View style={styles.gardenContainer}>
        <Text style={styles.sectionTitle}>🌿 My Garden</Text>
      </View>
      */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },

  headerContainer: {
    alignItems: 'center',
    position: 'relative',
  },

  backgroundImage: {
    width: width,
    height: height * 0.35,
  },

  welcomeText: {
    position: 'absolute',
    top: '6%',
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 130,
  },

  searchBarContainer: {
    alignItems: 'center',
    marginTop: 15,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '90%',
    elevation: 3,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  gardenContainer: {
    marginTop: 15,
    backgroundColor: '#8ABD91',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,

  },
});
 