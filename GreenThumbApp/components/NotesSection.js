import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotesSection = ({ plantId }) => {
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

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
      console.error('Failed to load notes history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!plantId) {
      Alert.alert('Error', 'Invalid plant ID');
      return;
    }

    if (!notes.trim()) {
      Alert.alert('Error', 'Please write a note before saving');
      return;
    }

    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const newEntry = {
        notes: notes.trim(),
        createdAt: firestore.Timestamp.now(),
      };

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('myGarden')
        .doc(plantId)
        .collection('snapHistory')
        .add(newEntry);

      console.log('Note saved successfully');
      setNotes('');
      loadHistory();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', `Failed to save note: ${error.message}`);
    }
  };

  const renderHistory = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#4CAF50" />;
    }

    return history.map((item) => (
      <View key={item.id} style={styles.historyItemContainer}>
        <Text style={styles.historyDate}>
          {new Date(item.createdAt?.seconds * 1000).toLocaleDateString('en-GB')}
        </Text>

        <View style={styles.historyCard}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
          </TouchableOpacity>
          <Text style={styles.historyNotes}>{item.notes}</Text>
        </View>
      </View>
    ));
  };

  return (
<View style={styles.wrapper}>
  <View style={styles.historyContainer}>
    <ScrollView>
      {renderHistory()}
    </ScrollView>
  </View>

  <View style={styles.bottomContainer}>
    <TextInput
      style={styles.input}
      onPressIn={() => setModalVisible(true)}
      placeholder="Record your plant’s progress!"
      placeholderTextColor="#999"
      value={notes}
      onChangeText={setNotes}
      multiline
    />
  </View>
</View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  historyItemContainer: { marginBottom: 15 },
  historyDate: { color: '#aaa', fontSize: 14, marginBottom: 5 },
  historyCard: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 70,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  historyNotes: {
    color: '#fff',
    fontSize: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
    zIndex: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  modalContent: {
    padding: 20,
    marginTop: 50,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  cancelText: { color: '#007AFF', fontSize: 16 },
  doneText: { color: '#007AFF', fontSize: 16 },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  modalInput: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  
});

export default NotesSection;
