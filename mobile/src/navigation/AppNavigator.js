import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Screen imports
import AuthScreen from '../screens/auth/LoginScreen'; // Renamed to AuthScreen
import HomeScreen from '../screens/home/HomeScreen';
import FindGymScreen from '../screens/findGym/FindGymScreen';
import GymScreen from '../screens/gym/GymScreen';
import CreatePostScreen from '../screens/createPost/CreatePostScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import SocialScreen from '../screens/social/SocialScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Feed') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'FindGyms') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'Social') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Messages') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff6b00', // Orange color matching frontend
      tabBarInactiveTintColor: '#999',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: '#eee',
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}
  >
    <Tab.Screen 
      name="Feed" 
      component={HomeScreen}
      options={{ 
        title: 'Feed',
        tabBarLabel: 'Feed'
      }}
    />
    <Tab.Screen 
      name="FindGyms" 
      component={FindGymScreen}
      options={{ 
        title: 'Find Gyms',
        tabBarLabel: 'Find Gyms'
      }}
    />
    <Tab.Screen 
      name="Social" 
      component={SocialScreen}
      options={{ 
        title: 'Social',
        tabBarLabel: 'Social'
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessagesScreen}
      options={{ 
        title: 'Messages',
        tabBarLabel: 'Messages'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ 
        title: 'Profile',
        tabBarLabel: 'Profile'
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="GymDetails" component={GymScreen} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
