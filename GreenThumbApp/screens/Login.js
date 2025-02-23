// Login Screen
// Using Firebase Authentication to log in user
// Automatically maintains sessions for users

import React, { useState } from 'react';
import { TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';

import { Button, Text } from "../components";

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'You are logged in!');
      navigation.replace('Main');
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Login</Text>      

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button gradient onPress={handleLogin} style={styles.fullWidthButton}>
        <Text center semibold white>
          Login
        </Text>
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullWidthButton: {
    width: "100%",  
    marginVertical: 10, 
  },  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2E6F40',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
