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
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  // ✅ Handle adding notes and images to Firestore
  const handleSave = async () => {
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

      const newEntry = {
        notes,
        images,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(plantId)
        .collection('snapHistory')
        .add(newEntry);

      setNotes('');
      setImages([]);
      loadHistory(); // Refresh history after saving
      setModalVisible(false);

    } catch (error) {
      console.error('Error saving snap history:', error);
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  // ✅ Open camera or gallery to add an image
  const handleAddImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        if (response.assets) {
          setImages([...images, ...response.assets.map((asset) => asset.uri)]);
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
        <TouchableOpacity onPress={handleAddImage} style={styles.cameraButton}>
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
