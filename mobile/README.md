# FitCheck Mobile App

A React Native mobile application for FitCheck - your fitness social platform.

## Features

- **Authentication**: Secure user login and registration
- **Gym Discovery**: Find and explore gyms near you
- **Social Feed**: Connect with other fitness enthusiasts
- **Reviews & Ratings**: Read and write gym reviews
- **Location Services**: GPS-based gym recommendations
- **Messaging**: Chat with other users (coming soon)
- **Profile Management**: Manage your fitness profile

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitcheck-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your backend API URL and Supabase configuration.

### Running the App

1. Start the development server:
   ```bash
   npm start
   ```

2. Scan the QR code with the Expo Go app to run on your device, or:
   - Press `a` to run on Android emulator
   - Press `i` to run on iOS simulator (macOS only)
   - Press `w` to run in web browser

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

## Backend Integration

This mobile app connects to the FitCheck backend API. Make sure your backend server is running on `http://localhost:5175` or update the `EXPO_PUBLIC_API_BASE_URL` in your `.env` file.

### Required Backend Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /posts/feed` - User feed
- `GET /gyms/nearby` - Nearby gyms
- `GET /gyms/search` - Search gyms

## Project Structure

```
src/
├── context/          # React Context providers
├── navigation/       # Navigation configuration
├── screens/          # App screens
│   ├── auth/        # Authentication screens
│   ├── home/        # Home screen
│   ├── explore/     # Gym exploration
│   ├── social/      # Social features
│   ├── messages/    # Messaging
│   └── profile/     # User profile
└── services/        # API services
```

## Technologies Used

- **React Native with Expo** - Mobile app framework
- **React Navigation** - Navigation library
- **Axios** - HTTP client for API calls
- **AsyncStorage** - Local storage for user data
- **Expo Location** - GPS and location services
- **Expo Camera** - Camera integration
- **Expo Notifications** - Push notifications

## Environment Variables

Create a `.env` file in the root directory with:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5175
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SITE_URL=http://localhost:5173
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
