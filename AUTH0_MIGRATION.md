# Auth0 Migration Guide

This document outlines the steps taken to migrate from Netlify Identity to Auth0 for the Trip Expense Tracker application.

## Migration Summary

### ✅ Completed Changes

1. **Removed Netlify Identity Dependencies**

   - Uninstalled `netlify-identity-widget` package
   - Removed Netlify Identity script from `public/index.html`
   - Removed `src/netlify-identity-widget.d.ts` type definitions

2. **Added Auth0 Dependencies**

   - Installed `@auth0/auth0-react` package
   - Added Auth0 configuration files

3. **Created Auth0 Components**

   - `src/auth/auth0-config.ts` - Auth0 configuration
   - `src/auth/Auth0ProviderWithHistory.tsx` - Auth0 provider wrapper
   - `src/components/LoginButton.tsx` - Login button component
   - `src/components/LogoutButton.tsx` - Logout button component
   - `src/components/Profile.tsx` - User profile display

4. **Updated Main Application**
   - Refactored `src/App.tsx` to use Auth0 hooks
   - Updated `src/index.js` to wrap app with Auth0 provider
   - Added environment variables configuration

## Configuration Required

### 1. Auth0 Application Setup

Create a new Auth0 application with the following settings:

- **Application Type**: Single Page Application
- **Allowed Callback URLs**:
  - `http://localhost:3000` (for development)
  - `https://your-domain.netlify.app` (for production)
- **Allowed Logout URLs**:
  - `http://localhost:3000`
  - `https://your-domain.netlify.app`
- **Allowed Web Origins**:
  - `http://localhost:3000`
  - `https://your-domain.netlify.app`

### 2. Environment Variables

Update the following environment variables:

#### Local Development (.env file)

```
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-api-identifier
```

#### Netlify Environment Variables

Go to Site Settings > Environment Variables and add:

- `REACT_APP_AUTH0_DOMAIN`
- `REACT_APP_AUTH0_CLIENT_ID`
- `REACT_APP_AUTH0_AUDIENCE`

### 3. Auth0 API Setup (Optional)

If you want to secure your Netlify functions with JWT tokens:

1. Create an Auth0 API
2. Set the identifier as your `REACT_APP_AUTH0_AUDIENCE`
3. Update your Netlify functions to validate JWT tokens

## Usage

### Authentication Flow

1. **Login**: Users click the "Login" button to authenticate with Auth0
2. **User State**: The app uses Auth0's `useAuth0` hook to manage user state
3. **Protected Content**: Expense forms and lists are only shown to authenticated users
4. **Logout**: Users can click "Logout" to end their session

### User Data

- User information is available through the `user` object from `useAuth0`
- User ID can be accessed via `user.sub` for linking to backend data
- Profile picture and name are displayed in the header

## Testing

### Local Development

1. Install dependencies: `npm install`
2. Set up your Auth0 application and configure environment variables
3. Start the development server: `npm start`
4. Test login/logout functionality

### Production Deployment

1. Configure Auth0 application with production URLs
2. Set environment variables in Netlify
3. Deploy to Netlify
4. Test authentication flow in production

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure callback URLs are correctly configured in Auth0
2. **"Client ID not found"**: Check that `REACT_APP_AUTH0_CLIENT_ID` is set correctly
3. **"Domain not found"**: Verify `REACT_APP_AUTH0_DOMAIN` is set correctly

### Debug Mode

Enable Auth0 debug mode by adding to `auth0-config.ts`:

```typescript
authorizationParams: {
  redirect_uri: auth0Config.redirectUri,
  audience: auth0Config.audience,
  debug: true,
}
```

## Next Steps

1. **Backend Integration**: Update Netlify functions to use Auth0 user IDs
2. **Data Migration**: Map existing user data to new Auth0 user IDs
3. **Enhanced Security**: Add JWT validation to API endpoints
4. **User Management**: Implement user profile management features
