import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://abamtegziqubfiicyftc.supabase.co';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    // Handle deep linking for Google auth (if needed)
    const handleDeepLink = (url) => {
      // Extract token from URL if coming back from OAuth
      console.log('Deep link received:', url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validate inputs
    if (!email || !password || !username) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        username
      });

      if (response.data.success) {
        setConfirmationMessage("Please check your email and verify your account before signing in.");
        setIsSignUp(false);  // Switch to login form
        setEmail('');  // Clear the form
        setPassword('');
        setUsername('');
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password
      });

      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        
        // Set expiration if rememberMe is checked (7 days)
        if (rememberMe) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          await AsyncStorage.setItem('expiresAt', expiresAt.toISOString());
        }
        
        // Navigate to main app or trigger auth state change
        // This will be handled by the AuthContext
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setConfirmationMessage('');
    setEmail('');
    setPassword('');
    setUsername('');
    setRememberMe(false);
  };

  const handleGoogleAuth = async () => {
    try {
      if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
        setError('Google sign-in is not configured. Please contact support.');
        return;
      }
      
      // For mobile, we would typically use a proper OAuth flow
      // For now, show a coming soon message
      Alert.alert('Coming Soon', 'Google sign-in will be available soon!');
      
      // TODO: Implement proper OAuth flow for mobile
      // const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('yourapp://auth')}`;
      // await Linking.openURL(authUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Failed to initiate Google sign-in');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Orange Header Section - matching frontend left panel */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <MaterialIcons name="fitness-center" size={36} color="#ff6b00" />
              </View>
            </View>
            <Text style={styles.brandTitle}>
              {isSignUp ? 'Join FitCheck' : 'Login To Your FitCheck Account'}
            </Text>
            <Text style={styles.brandSubtitle}>
              Track, review, and discover the best gyms in your area
            </Text>
          </View>

          {/* White Form Section - matching frontend right panel */}
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isSignUp ? 'Sign up to start using FitCheck' : 'Sign in to continue to FitCheck'}
              </Text>
            </View>

            {/* Error and confirmation messages */}
            {error ? (
              <View style={styles.errorMessage}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {confirmationMessage ? (
              <View style={styles.confirmationMessage}>
                <Text style={styles.confirmationText}>{confirmationMessage}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#aaa"
                />
              </View>

              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={[styles.input, error && styles.inputError]}
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#aaa"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#aaa"
                  minLength={isSignUp ? 6 : undefined}
                />
              </View>

              {!isSignUp && (
                <View style={styles.formOptions}>
                  <TouchableOpacity 
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <MaterialIcons 
                      name={rememberMe ? "check-box" : "check-box-outline-blank"} 
                      size={20} 
                      color="#ff6b00" 
                    />
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleAuth}
              >
                <MaterialIcons name="account-circle" size={20} color="#fff" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.authToggle}>
                <Text style={styles.authToggleText}>
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode}>
                  <Text style={styles.authToggleLink}>
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  
  // Header Section (Orange - matching frontend left panel)
  headerSection: {
    backgroundColor: '#ff6b00', // Primary orange
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 34,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  
  // Form Section (White - matching frontend right panel)
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  formHeader: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222', // Primary black
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#444444', // Dark gray
  },
  
  // Messages
  errorMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  confirmationMessage: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  confirmationText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Form
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#222222',
  },
  inputError: {
    borderColor: '#f44336',
  },
  
  // Form options (remember me, forgot password)
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#444444',
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '500',
  },
  
  // Buttons
  submitButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ff6b00', // Primary orange
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Divider
  divider: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#444444',
  },
  
  // Google button
  googleButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ff6b00', // Primary orange (matching frontend)
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  
  // Auth toggle
  authToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  authToggleText: {
    fontSize: 14,
    color: '#444444',
  },
  authToggleLink: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '500',
  },
});

export default AuthScreen;
