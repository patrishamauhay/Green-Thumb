import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotesSection = () => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.innerContainer}>
        {/* ✅ Scrollable Notes Area */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.text}>This is where your notes will go.</Text>
          </View>
        </ScrollView>

        {/* ✅ Sticky Input Bar */}
        <View style={styles.bottomContainer}>
          <TextInput
            style={styles.input}
            placeholder="Record your plant’s progress!"
            placeholderTextColor="#999"
            multiline
            editable={false}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={28} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#eee',
    padding: 20,
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    color: '#333',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 10,
  },
  cameraButton: {
    padding: 5,
  },
});

export default NotesSection;
