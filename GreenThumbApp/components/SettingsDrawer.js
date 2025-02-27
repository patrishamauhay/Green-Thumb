import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('screen');

const SettingsDrawer = ({ slideAnim, closeDrawer, user, handleLogout }) => {
  return (
    <Animated.View style={[styles.drawer, { top: slideAnim }]}>
      <View style={styles.drawerContent}>

        {/* Close Button */}
        <TouchableOpacity onPress={closeDrawer} style={styles.closeDrawer}>
          <Ionicons name="close-outline" size={28} color="#333" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Ionicons name="person-circle-outline" size={80} color="#333" />
          <Text style={styles.profileName}>{user?.displayName || 'John Doe'}</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#5A5A5A" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.90,
    backgroundColor: '#fff',
    elevation: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  drawerContent: {
    flex: 1,
  },
  closeDrawer: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
    marginTop: 20,
  },
  logoutText: {
    color: '#5A5A5A',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SettingsDrawer;
