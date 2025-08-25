# FitCheck Mobile App - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React Native mobile application for FitCheck - a fitness social platform.

## Project Context
- **Framework**: React Native with Expo
- **Backend**: Express.js with Supabase (PostgreSQL)
- **Main Features**: Gym reviews, social feeds, messaging, location-based services
- **API Base URL**: http://localhost:5175
- **Supabase URL**: https://abamtegziqubfiicyftc.supabase.co/

## Development Guidelines
- Use TypeScript for type safety
- Follow React Native best practices and performance optimization
- Implement responsive design for different screen sizes
- Use Expo Vector Icons for consistent iconography
- Implement proper error handling and loading states
- Use React Navigation for navigation between screens
- Implement proper state management (Context API or Redux if needed)

## Code Style
- Use functional components with hooks
- Prefer const assertions for constant values
- Use descriptive component and function names
- Implement proper prop typing with TypeScript interfaces
- Follow consistent file and folder naming conventions

## Mobile-Specific Considerations
- Implement touch-friendly UI with proper hit areas
- Use platform-specific styles when necessary
- Handle keyboard avoiding behavior
- Implement proper image optimization
- Use native device features (camera, location, notifications)
- Follow platform-specific design guidelines (Material Design / Human Interface Guidelines)

## API Integration
- Reuse existing backend APIs without modification
- Implement proper authentication flow
- Handle offline scenarios gracefully
- Implement proper caching strategies
- Use proper HTTP status code handling
