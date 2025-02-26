import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function WaterHistory({ navigation }) {
  const [user, setUser] = useState(null);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
    {/* Header with Back Button */}
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="grey" />
      </TouchableOpacity>
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      flex: 1,
      backgroundColor: '#F5F5F5',
      padding: 20,
    },
    /* Header Styles */
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: '#E3E3E3',
      marginRight: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    /* Logout Button */
    logoutButton: {
      backgroundColor: '#D32F2F',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 15,
    },
    logoutText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });