import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => Alert.alert('Feature', 'Account deletion will be available soon') 
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <MaterialIcons name={icon} size={24} color="#666" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <MaterialIcons name="chevron-right" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="person"
            title="Edit Profile"
            subtitle="Change your profile information"
            onPress={() => Alert.alert('Feature', 'Edit profile coming soon')}
          />
          
          <SettingItem
            icon="lock"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Feature', 'Privacy settings coming soon')}
          />
          
          <SettingItem
            icon="email"
            title="Change Email"
            subtitle="Update your email address"
            onPress={() => Alert.alert('Feature', 'Change email coming soon')}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Push notifications for new messages and updates"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#ccc', true: '#ff6b00' }}
                thumbColor="#ffffff"
              />
            }
          />
          
          <SettingItem
            icon="location-on"
            title="Location Services"
            subtitle="Help find nearby gyms and users"
            rightComponent={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#ccc', true: '#ff6b00' }}
                thumbColor="#ffffff"
              />
            }
          />
          
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle="Toggle dark theme"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#ccc', true: '#ff6b00' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon="help"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Support', 'Email us at support@fitcheck.com')}
          />
          
          <SettingItem
            icon="feedback"
            title="Send Feedback"
            subtitle="Help us improve the app"
            onPress={() => Alert.alert('Feedback', 'Feedback form coming soon')}
          />
          
          <SettingItem
            icon="star"
            title="Rate the App"
            subtitle="Rate us on the App Store"
            onPress={() => Alert.alert('Rate', 'Redirecting to App Store...')}
          />
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <SettingItem
            icon="description"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
          />
          
          <SettingItem
            icon="security"
            title="Privacy Policy"
            subtitle="Learn about our privacy practices"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#ff6b00" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteItem} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={24} color="#ff4444" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>FitCheck v1.0.0</Text>
          <Text style={styles.buildInfo}>Build 2025.08.25</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  content: {
    flex: 1,
  },
  
  // Sections
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Setting Items
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Special Items
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#ff6b00',
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deleteText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#ff4444',
  },
  
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buildInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default SettingsScreen;
