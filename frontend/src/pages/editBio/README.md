# Edit Bio Page

This page allows users to edit their profile bio with a modern, mobile-responsive interface.

## Features

- **Real-time character counter** with 500 character limit
- **Mobile-first responsive design** that looks amazing on all devices
- **Token-based authentication** using Supabase JWT tokens
- **Form validation** with helpful error messages
- **Unsaved changes detection** with confirmation dialog
- **Loading states** and success/error feedback
- **Accessibility features** including focus management and screen reader support

## Backend Integration

The page integrates with the following backend endpoints:

- `GET /api/getUserBio` - Fetches the current user's bio
- `PUT /api/updateUserBio` - Updates the user's bio

Both endpoints require authentication via Bearer token in the Authorization header.

## Mobile Responsiveness

The design is optimized for mobile devices with:

- Touch-friendly button sizes (44px minimum)
- Responsive typography that scales appropriately
- Optimized spacing and padding for small screens
- Full-width buttons on mobile for better usability
- Sticky header that stays accessible while scrolling

## Usage

1. Navigate to `/editBio` route
2. The page automatically loads your current bio
3. Edit your bio in the textarea
4. Character counter shows remaining characters
5. Click "Save Changes" to update your bio
6. Success message appears and redirects back to profile

## Navigation

Users can access this page from:

- Profile page: Quick edit link next to bio field
- Public profile: Edit bio button in profile actions
- Direct URL: `/editBio`

## Styling

The page uses SCSS with:

- CSS custom properties for consistent theming
- Mobile-first responsive design
- Smooth animations and transitions
- Consistent with the app's design system
- Support for high contrast and reduced motion preferences

## Error Handling

- Network errors are caught and displayed
- Validation errors show helpful messages
- Loading states prevent multiple submissions
- Unsaved changes are detected and confirmed

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast mode support
- Reduced motion support 