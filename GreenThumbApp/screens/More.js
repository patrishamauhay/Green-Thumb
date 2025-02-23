import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Home({ navigation }) {
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
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
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
