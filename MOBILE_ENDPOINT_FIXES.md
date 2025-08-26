# Mobile Endpoint Fixes

## Summary
Fixed mobile application endpoints to match the backend API structure. The mobile app was using different endpoint naming conventions and data formats than the existing backend.

## Issues Fixed

### 1. User Routes (`userRoutes.js`)
**Added Mobile Compatibility Routes:**
- `GET /api/users` → maps to existing `getAllUsers` (mobile expected `/api/users` instead of `/api/getAllUsers`)
- `POST /api/posts` → maps to existing `createPost` (mobile expected `/api/posts` instead of `/api/createPost`)
- `GET /api/user/posts` → new `getUserPosts` function
- `GET /api/user/stats` → new `getUserStats` function

**New Controller Functions Added to `userController.js`:**
- `getUserPosts()` - Returns user's posts with user profile data
- `getUserStats()` - Returns user statistics (posts, PRs, followers, following counts)

### 2. Post Routes (`postRoutes.js`)
**Added Mobile Compatibility Route:**
- `GET /api/getPosts` → maps to existing `getPosts` (mobile expected `/api/getPosts` instead of `/api/posts`)

### 3. Profile Routes (`profileRoutes.js`)
**Added Mobile Compatibility Routes:**
- `POST /api/follow` → new `followUser` function (mobile sends `userId` instead of `targetUserName`)
- `POST /api/profile/image` → maps to existing `uploadProfilePicture`
- `PUT /api/profile/bio` → maps to existing `updateUserBio`

**New Controller Function Added to `followerController.js`:**
- `followUser()` - Mobile-compatible follow function that accepts `userId` parameter

### 4. Message Routes (`messageRoutes.js`)
**Added Mobile Compatibility Routes:**
- `GET /api/chats` → new `getUserChatsForMobile` function (returns direct array)
- `GET /api/messages/:chatId` → new `getChatMessagesById` function (chatId from URL params)
- `POST /api/messages` → maps to existing `newMessage`

**New Controller Functions Added to `messageController.js`:**
- `getChatMessagesById()` - Gets messages by chatId from URL params instead of request body
- `getUserChatsForMobile()` - Returns chat data as direct array instead of wrapped in success object

### 5. Gym Routes (`gymRoutes.js`)
**Added Mobile Compatibility Routes:**
- `GET /api/gym/:gymId` → new `getGymById` function
- `GET /gyms/nearby` → new `getNearbyGyms` function

**New Controller Functions Added to `gymController.js`:**
- `getGymById()` - Returns gym details by ID
- `getNearbyGyms()` - Returns list of nearby gyms (currently returns all gyms with limit)

### 6. Mobile App Token Storage Fix (`mobile/src/services/api.js`)
**Fixed Token Inconsistency:**
- Changed from `'authToken'` to `'token'` for consistent token storage across the mobile app

## Data Format Differences Addressed

### Mobile vs Web API Expectations:
1. **Follow Endpoint**: Mobile sends `{ userId }` while web sends `{ targetUserName }`
2. **Chat Messages**: Mobile expects direct array response, web expects `{ success: true, data: [...] }`
3. **Get Chats**: Mobile expects chatId as URL parameter, web sends in request body
4. **User Stats**: Mobile expects combined stats object, web has separate endpoints

### Response Format Harmonization:
- Mobile endpoints return data directly when possible
- Maintained backward compatibility with existing web frontend
- Added proper error handling for mobile-specific requirements

## Testing Recommendations

1. **Authentication**: Verify token storage consistency between `'token'` and `'authToken'`
2. **User Posts**: Test `/api/user/posts` returns proper post data with user profiles
3. **User Stats**: Test `/api/user/stats` returns accurate counts
4. **Follow System**: Test `/api/follow` with `userId` parameter
5. **Messages**: Test `/api/messages/:chatId` and `/api/chats` endpoints
6. **Gym Data**: Test `/api/gym/:gymId` and `/gyms/nearby` endpoints

## Notes

- All existing web frontend endpoints remain unchanged
- Mobile compatibility routes are additive, not replacing existing functionality
- Error handling follows mobile app expectations (simpler error objects)
- Token authentication works consistently across mobile and web platforms
