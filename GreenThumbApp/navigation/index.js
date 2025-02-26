// File for navigating through different screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from '../screens/Welcome';
import LoginScreen from '../screens/Login';
import SignUpScreen from '../screens/SignUp';
import Home from '../screens/Home';
import WaterPlant from '../screens/WaterPlant';
import Search from '../screens/Search'
import PlantDetails from '../screens/PlantDetails'
import UserPlantDetails from '../screens/UserPlantDetails'
import MyGarden from '../screens/MyGarden'
import More from '../screens/More'
import WaterHistory from '../screens/WaterHistory'



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Water') { 
            iconName = 'water-outline';         
          } else if (route.name === 'Search') {
            iconName = 'search-outline';         
          } else if (route.name === 'My Garden') {  
            iconName = 'leaf-outline';          
          }else if (route.name === 'More') {  
            iconName = 'ellipsis-horizontal-outline';          
          }
        
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Water" component={WaterPlant} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="My Garden" component={MyGarden} />
      <Tab.Screen name="More" component={More} />

    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="PlantDetails" component={PlantDetails} />
        <Stack.Screen name="UserPlantDetails" component={UserPlantDetails} />
        <Stack.Screen name="WaterHistory" component={WaterHistory} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
