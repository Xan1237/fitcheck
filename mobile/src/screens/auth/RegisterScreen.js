import React from 'react';
import AuthScreen from './LoginScreen';

// RegisterScreen redirects to the unified AuthScreen
// The AuthScreen handles both login and registration
const RegisterScreen = ({ navigation }) => {
  return <AuthScreen navigation={navigation} />;
};

export default RegisterScreen;
