# FitCheck Mobile App

A comprehensive React Native mobile application that recreates all the functionality from the FitCheck web frontend, providing a native mobile experience for fitness enthusiasts.

## 📱 Features Implemented

### ✅ Authentication
- **Unified Auth Screen**: Combined login/register with form validation
- **Token Management**: Persistent authentication using AsyncStorage
- **Auto-login**: Automatic authentication on app launch
- **Password validation**: Strong password requirements

### ✅ Gym Discovery
- **Find Gyms Screen**: Search and filter gyms by location
- **Gym Details**: Comprehensive gym information with reviews
- **Review System**: Rate and review gyms with tags
- **Location Integration**: Ready for GPS-based gym discovery

### ✅ Social Feed
- **Home Feed**: Display posts from all users
- **Create Posts**: Share workout photos and stories
- **Like & Comment**: Interact with community posts
- **User Discovery**: Find and follow other fitness enthusiasts

### ✅ Messaging
- **Chat List**: View all conversations
- **Real-time Chat**: Send and receive messages
- **Group Support**: Ready for group conversations
- **Message Status**: Delivery and read indicators

### ✅ Profile Management
- **User Profile**: Complete profile with stats
- **Edit Profile**: Update bio and profile picture
- **Activity Tracking**: Posts, followers, following counts
- **Image Upload**: Camera and gallery integration

### ✅ Settings & Preferences
- **App Settings**: Notifications, location, dark mode
- **Account Management**: Privacy, security settings
- **Support**: Help, feedback, and rating options

## 🛠 Technical Implementation

### Architecture
- **React Native + Expo**: Cross-platform mobile development
- **React Navigation**: Stack and tab navigation
- **Context API**: Global state management for authentication
- **Axios**: HTTP client with token interceptors

### API Integration
- **Backend Compatibility**: All API calls match the existing backend
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators
- **Offline Support**: Ready for offline functionality

### UI/UX Design
- **Consistent Styling**: Matches web frontend design language
- **Material Icons**: Consistent iconography
- **Responsive Design**: Adapts to different screen sizes
- **Native Feel**: Platform-specific UI components

## 📁 Project Structure

```
mobile/src/
├── components/          # Reusable UI components
├── context/
│   └── AuthContext.js   # Authentication state management
├── navigation/
│   └── AppNavigator.js  # Navigation configuration
├── screens/
│   ├── auth/           # Login/Register screens
│   ├── home/           # Feed and dashboard
│   ├── findGym/        # Gym discovery
│   ├── gym/            # Gym details and reviews
│   ├── createPost/     # Post creation
│   ├── social/         # User discovery
│   ├── messages/       # Chat functionality
│   ├── chat/           # Individual conversations
│   ├── profile/        # User profile management
│   └── settings/       # App settings
└── services/
    └── api.js          # API configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator

### Installation
1. Navigate to the mobile directory:
   ```bash
   cd fitcheck/mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open in simulator:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the mobile directory:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5175
```

### Backend Integration
The app is configured to work with the existing FitCheck backend:
- Authentication endpoints: `/auth/signin`, `/auth/signup`
- Posts API: `/api/getPosts`, `/api/posts`
- Gym API: `/api/getGymsByProvince`, `/api/gym/:id`
- Comments API: `/api/comment`, `/api/GetComments`
- User API: `/api/profile`, `/api/users`

## 📱 Key Screens

### Authentication Flow
- **AuthScreen**: Unified login/register with validation
- **Loading**: Authentication state check

### Main App Flow
- **HomeScreen**: Social feed with quick actions
- **FindGymScreen**: Gym search with filters
- **GymScreen**: Detailed gym view with reviews
- **SocialScreen**: User discovery and following
- **MessagesScreen**: Chat list and conversations
- **ProfileScreen**: User profile with settings access

### Additional Features
- **CreatePostScreen**: Post creation with image upload
- **ChatDetailScreen**: Individual chat interface
- **SettingsScreen**: App preferences and account management

## 🎨 Design System

### Colors
- Primary: `#ff6b00` (Orange)
- Background: `#f5f5f5` (Light gray)
- Cards: `#ffffff` (White)
- Text: `#222` (Dark gray)
- Secondary Text: `#666` (Medium gray)

### Typography
- Headers: 18-24px, weight 600-700
- Body: 14-16px, weight 400-500
- Captions: 12-14px, weight 400

### Components
- Consistent border radius: 8-12px
- Card shadows and elevation
- Material Design icons
- Responsive touch targets

## 🔄 State Management

### Authentication Context
- User authentication state
- Token management
- Auto-logout on token expiry
- Persistent login state

### Local State
- Component-level state for UI interactions
- Form validation and input handling
- Loading states and error handling

## 📊 API Integration

### Request Interceptors
- Automatic token attachment
- Request/response logging
- Error handling

### Response Handling
- Standardized error messages
- Loading state management
- Success feedback

## 🧪 Testing Ready

The app structure is designed for easy testing:
- Modular components
- Separated business logic
- Mock-friendly API layer
- Clear component boundaries

## 🚀 Future Enhancements

### Planned Features
- Push notifications
- Offline synchronization
- Real-time messaging with WebSockets
- GPS-based gym discovery
- Workout tracking
- Progress photos
- Social features expansion

### Performance Optimizations
- Image caching
- List virtualization
- Background sync
- Memory optimization

## 📝 Notes

This mobile app provides a complete native recreation of the FitCheck web frontend, maintaining feature parity while optimizing for mobile user experience. The architecture is scalable and ready for production deployment.

All API endpoints match the existing backend, ensuring seamless integration with the current server infrastructure.
