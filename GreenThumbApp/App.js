import React from 'react';
import AppNavigator from './navigation';
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/storage';

if (!firebase.apps.length) {
  firebase.initializeApp({
    storageBucket: 'greenthumb-125c0.appspot.com',
  });
}


export default function App() {
  return <AppNavigator />;
}
