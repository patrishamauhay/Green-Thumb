import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

const NotesSection = ({ plantId }) => {
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  // ✅ Load history from Firestore
  const loadHistory = async () => {
    try {
      setLoading(true);
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(plantId)
        .collection('snapHistory')
        .orderBy('createdAt', 'desc')
        .get();

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHistory(data);
    } catch (error) {
      console.error('Failed to load snap history:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload to Firebase Storage and get the download URL
  const uploadImage = async (uri) => {
    try {
      if (!uri || typeof uri !== 'string') { // Ensure uri is valid and a string
        console.error('Invalid URI:', uri);
        Alert.alert('Error', 'Invalid file URI');
        return null;
      }
  
      let path = uri;
  
      // ✅ Handle content:// URIs correctly
      if (uri.startsWith('content://')) {
        const newPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.jpg`;
        await RNFS.copyFile(uri, newPath);
        path = `file://${newPath}`;
      }
  
      // ✅ Double-check that path is a string before proceeding
      if (!path || typeof path !== 'string') {
        console.error('Path is null or not a string:', path);
        Alert.alert('Error', 'Invalid file path');
        return null;
      }
  
      // ✅ Ensure path exists before proceeding
      const fileExists = await RNFS.exists(path);
      if (!fileExists) {
        console.error('File does not exist at path:', path);
        Alert.alert('Error', 'File not found');
        return null;
      }
  
      console.log('Uploading file at path:', path);
  
      // ✅ Extract filename from valid path
      const filename = path.substring(path.lastIndexOf('/') + 1);
      const reference = storage().ref(`snapHistory/${filename}`);
  
      console.log('Uploading to Firebase Storage:', filename);
  
      await reference.putFile(path);
  
      const url = await reference.getDownloadURL();
      console.log('Upload successful. URL:', url);
      return url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      Alert.alert('Error', 'Failed to upload image');
      return null;
    }
  };
  

  // ✅ Handle adding notes and images to Firestore
  const handleSave = async () => {
    if (!plantId) {
      Alert.alert('Error', 'Invalid plant ID');
      return;
    }
  
    if (!notes.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add notes or an image');
      return;
    }
  
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }
  
      console.log('User ID:', userId);
      console.log('Plant ID:', plantId);
      console.log('Notes:', notes);
  
      // ✅ Remove images field if empty
      const newEntry = {
        notes: typeof notes === 'string' ? notes.trim() : '',
        createdAt: firestore.Timestamp.now(),
      };
  
      if (images.length > 0) {
        newEntry.images = images;
      }
  
      console.log('Saving data:', newEntry);
  
      const docPath = `users/${userId}/myGarden/${plantId}/snapHistory`;
      console.log('Firestore path:', docPath);
  
      const docRef = await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(plantId)
        .collection('snapHistory')
        .add(newEntry);
  
      console.log('Successfully saved note with ID:', docRef.id);
  
      setNotes('');
      setImages([]);
      loadHistory(); // Refresh history after saving
      setModalVisible(false);
  
    } catch (error) {
      console.error('Error saving snap history:', error);
      Alert.alert('Error', `Failed to save note: ${error.message}`);
    }
  };
  
  // ✅ Open camera or gallery to add an image
  const handleAddImage = async () => {
    Alert.alert(
      'Add Image',
      'Choose an option:',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Library',
          onPress: () => openLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
  
  const openCamera = async () => {
  launchCamera(
    {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
    },
    async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;

        // ✅ Upload image and get download URL
        const downloadUrl = await uploadImage(uri);
        if (downloadUrl) {
          setImages((prevImages) => [...prevImages, downloadUrl]); // Save download URL to state
        }
      } else {
        console.error('Invalid image response:', response);
      }
    }
  );
};

const openLibrary = async () => {
  launchImageLibrary(
    {
      mediaType: 'photo',
      quality: 0.8,
    },
    async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;

        // ✅ Upload image and get download URL
        const downloadUrl = await uploadImage(uri);
        if (downloadUrl) {
          setImages((prevImages) => [...prevImages, downloadUrl]); // Save download URL to state
        }
      } else {
        console.error('Invalid image response:', response);
      }
    }
  );
};



  // ✅ Render history in a timeline format
  const renderHistory = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#4CAF50" />;
    }

    return history.map((item) => (
      <View key={item.id} style={styles.historyItemContainer}>
        {/* ✅ Date */}
        <Text style={styles.historyDate}>
          {new Date(item.createdAt?.seconds * 1000).toLocaleDateString('en-GB')}
        </Text>

        <View style={styles.historyCard}>
          {/* ✅ Three Dots */}
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
          </TouchableOpacity>

          {/* ✅ Notes */}
          <Text style={styles.historyNotes}>{item.notes}</Text>

          {/* ✅ Images */}
          {item.images &&
            item.images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* ✅ Timeline */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderHistory()}
      </ScrollView>

      {/* ✅ Bottom Input Section */}
      <View style={styles.bottomContainer}>
        {/* ✅ Text Input */}
        <TextInput
          style={styles.input}
          onPress={() => setModalVisible(true)}
          placeholder="Record your plant’s progress!"
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* ✅ Camera Button */}
      <TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
        <Ionicons name="camera-outline" size={28} color="#999" />
      </TouchableOpacity>

      </View>

      {/* ✅ Full Screen Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* ✅ Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Record your plant’s progress!"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {/* ✅ Image Upload */}
            <Text style={styles.label}>Add Images ({images.length}/3)</Text>
            <TouchableOpacity onPress={handleAddImage} style={styles.imageUpload}>
              <Ionicons name="add" size={30} color="#999" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  historyItemContainer: {
    marginBottom: 15,
  },
  historyDate: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  historyCard: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  historyNotes: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 5,
  },

  /* ✅ Bottom Input Section */
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#F9F9F9', // Light background color
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E5E5E5', // Light border color
  },
  input: {
    flex: 1,
    color: '#333', // Darker text color for contrast
    backgroundColor: '#FFFFFF', // White background for input field
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5', // Light border color
  },
  cameraButton: {
    marginLeft: 10,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  modalContent: {
    padding: 20,
    marginTop: 50, // Slide to top
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  modalInput: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
  },
  imageUpload: {
    width: 100,
    height: 100,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default NotesSection;
