import firestore from '@react-native-firebase/firestore';

// Function to get the Firestore reference
export const getUserFavoritesRef = (userId) => {
  return firestore().collection('users').doc(userId).collection('favorites');
};
