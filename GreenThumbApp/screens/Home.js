// Home.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login'); // Redirect to login after logout
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.displayName || user.name}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
});
