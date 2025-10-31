# FitCheck 🏋️‍♂️

A comprehensive social fitness platform that connects gym enthusiasts, enables gym discovery, and fosters a community of fitness-minded individuals. FitCheck combines social networking with fitness tracking, allowing users to share workout posts, discover gyms, track personal records, and connect with like-minded people.

## 🌟 Features

### 🔐 Authentication & User Management
- **Multi-Provider Authentication**: Email/password and Google OAuth integration
- **User Profiles**: Customizable profiles with bio, profile pictures, and personal stats
- **Username System**: Unique usernames with profile customization
- **Account Verification**: Email verification for new accounts

### 📱 Social Features
- **Feed System**: Infinite scroll feed with workout posts and updates
- **Post Creation**: Rich post creation with image uploads, descriptions, and tags
- **Engagement**: Like, comment, and share posts with real-time updates
- **Following System**: Follow/unfollow users and see their activities
- **Real-time Messaging**: Direct messaging between users with WebSocket support
- **Profile Visits**: View other users' profiles, posts, and gym activities

### 🏋️‍♂️ Fitness Tracking
- **Personal Records (PRs)**: Track and manage personal bests for various exercises
- **Gym Integration**: Add gyms to your profile and share gym visits
- **Workout Posts**: Share workout descriptions, images, and achievements
- **Progress Tracking**: Visual representation of fitness journey

### 🏢 Gym Discovery
- **Gym Directory**: Comprehensive database of gyms with detailed information
- **Interactive Maps**: Location-based gym discovery using Leaflet maps
- **Gym Profiles**: Detailed gym pages with ratings, amenities, and user reviews
- **Search & Filter**: Advanced search functionality for finding gyms
- **User-Gym Associations**: Link your profile to gyms you frequent

### 💬 Communication
- **Real-time Chat**: Instant messaging system with WebSocket integration
- **Comment System**: Threaded comments on posts with real-time updates
- **Notifications**: Stay updated on likes, comments, and messages

## 🏗️ Architecture

### Frontend (React/Vite)
- **Framework**: React 19 with Vite for fast development
- **Routing**: React Router DOM for client-side navigation
- **State Management**: React hooks and context for state management
- **Styling**: SCSS for modular and maintainable styles
- **UI Components**: Custom component library with Lucide React icons
- **Image Handling**: React Image Crop for profile picture cropping
- **Maps**: React Leaflet for interactive gym location maps

### Backend (Node.js/Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: Supabase (PostgreSQL) for data persistence
- **Authentication**: Supabase Auth with custom token validation
- **File Storage**: Firebase Storage for image uploads
- **Real-time**: Socket.IO for live messaging and notifications
- **API Design**: RESTful API with comprehensive endpoint coverage

### Database Schema
- **Users**: Profile information, authentication data
- **Posts**: Social media posts with images and metadata
- **Comments**: Threaded comment system
- **Gyms**: Comprehensive gym database with locations and amenities
- **Personal Records**: User fitness tracking data
- **Messages**: Real-time messaging system
- **Relationships**: Following/follower associations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- Firebase project (for file storage)

### Environment Variables

Create `.env` files in both `frontend` and `backend` directories:

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=http://localhost:5173
```

#### Backend (.env)
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
NODE_ENV=development
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Xan1237/fitcheck.git
   cd fitcheck
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

5. **Set up database**
   - Create a Supabase project
   - Run the SQL scripts in `backend/sql/` to set up tables
   - Configure authentication providers in Supabase dashboard

6. **Set up Firebase Storage**
   - Create a Firebase project
   - Enable Storage and configure security rules
   - Generate service account credentials

### Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

#### Production Deployment

##### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

##### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure environment variables
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`

## 📁 Project Structure

```
fitcheck/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── header/     # Navigation header
│   │   │   ├── footer/     # Page footer
│   │   │   ├── BottomNav/  # Mobile navigation
│   │   │   ├── map/        # Map components
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── feed/       # Main social feed
│   │   │   ├── profile/    # User profiles
│   │   │   ├── gym/        # Gym pages
│   │   │   ├── messages/   # Messaging interface
│   │   │   └── ...
│   │   ├── services/       # API and external services
│   │   ├── data/           # Static data and configurations
│   │   └── assets/         # Images and media
│   └── package.json
├── backend/                 # Node.js backend server
│   ├── controllers/        # Route handlers and business logic
│   ├── routes/            # Express route definitions
│   ├── middleware/        # Custom middleware functions
│   ├── models/           # Data models and schemas
│   ├── config/           # Configuration files
│   ├── sql/             # Database scripts
│   ├── utils/           # Helper utilities
│   ├── websocket/       # Socket.IO configuration
│   └── package.json
├── restTests/           # API testing files
├── vercel.json         # Vercel deployment configuration
└── README.md
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/validate-google-token` - Google OAuth validation

### User Management
- `GET /api/profile/:username` - Get user profile
- `PUT /api/profile/:username` - Update user profile
- `POST /api/uploadProfilePicture` - Upload profile picture
- `GET /api/checkProfileOwnership/:username` - Check profile ownership

### Social Features
- `GET /api/posts` - Get feed posts with pagination
- `POST /api/createPost` - Create new post
- `DELETE /api/post/:id` - Delete post
- `POST /api/post/:id/comment` - Add comment
- `GET /api/post/:id/comments` - Get post comments
- `GET /api/addPostLike/:id` - Toggle post like

### Fitness Tracking
- `POST /api/addPersonalRecord` - Add personal record
- `PUT /api/pr` - Update personal record
- `DELETE /api/pr` - Delete personal record
- `GET /api/getNumberPR/:username` - Get PR count

### Gym Features
- `GET /api/getGymsByProvince/:province` - Get gyms by location
- `GET /api/gym/:id` - Get gym details
- `POST /api/addUserGym` - Associate user with gym
- `GET /api/getUserGyms/:username` - Get user's gyms

### Messaging
- `POST /api/newChat` - Create new chat
- `POST /api/newMessage` - Send message
- `GET /api/getMessages/:chatId` - Get chat messages
- `GET /api/getUserChats` - Get user's chats

### Social Network
- `POST /api/newFollower` - Follow user
- `POST /api/unfollowUser` - Unfollow user
- `GET /api/getFollowerCount/:username` - Get follower count
- `GET /api/getFollowingCount/:username` - Get following count

## 🛠️ Technologies Used

### Frontend Stack
- **React 19**: Latest React version with improved performance
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests
- **SCSS**: CSS preprocessor for enhanced styling
- **Socket.IO Client**: Real-time communication
- **React Leaflet**: Interactive maps
- **Lucide React**: Modern icon library
- **React Icons**: Additional icon sets
- **React Image Crop**: Image cropping functionality

### Backend Stack
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Supabase**: Backend-as-a-Service (Database & Auth)
- **Firebase Admin**: File storage and additional services
- **Socket.IO**: Real-time bidirectional communication
- **Morgan**: HTTP request logging
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Database & Services
- **PostgreSQL** (via Supabase): Primary database
- **Supabase Auth**: User authentication and management
- **Firebase Storage**: File and image storage
- **Vercel**: Frontend hosting and deployment
- **Render**: Backend hosting and deployment

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side request validation
- **File Upload Security**: Secure image upload handling
- **SQL Injection Protection**: Parameterized queries via Supabase

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Adaptive theming (can be extended)
- **Infinite Scroll**: Seamless content loading
- **Real-time Updates**: Live feed updates and messaging
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Accessibility**: ARIA labels and keyboard navigation support

## 🧪 Testing

### API Testing
- REST client files in `restTests/` directory
- Comprehensive endpoint testing with sample requests

### Running Tests
```bash
# Frontend tests (if configured)
cd frontend
npm test

# Backend API tests using REST files
# Use VS Code REST Client extension or similar tool
```

## 📱 Mobile Considerations

- **Responsive Breakpoints**: Optimized for mobile, tablet, and desktop
- **Touch-Friendly UI**: Appropriate touch targets and gestures
- **Mobile Navigation**: Bottom navigation bar for mobile users
- **Performance**: Optimized images and lazy loading

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Develop frontend and backend components
   - Test API endpoints using REST files
   - Ensure responsive design

2. **Code Review**
   - Create pull request
   - Review code for security and performance
   - Test deployment previews

3. **Deployment**
   - Merge to main branch
   - Automatic deployment via Vercel (frontend) and Render (backend)
   - Monitor application health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Contact

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Community discussions on GitHub Discussions
- **Email**: Contact the development team for urgent matters

## 🔮 Future Enhancements

- **Mobile App**: React Native application for iOS and Android
- **Advanced Analytics**: Workout tracking and progress analytics
- **Gym Partnerships**: Integration with gym management systems
- **Social Challenges**: Community fitness challenges and competitions
- **AI Recommendations**: Personalized gym and workout recommendations
- **Video Content**: Support for workout video sharing
- **Nutrition Tracking**: Meal logging and nutrition insights
