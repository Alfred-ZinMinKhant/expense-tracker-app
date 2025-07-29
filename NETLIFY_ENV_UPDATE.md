# Netlify Environment Variables Update Required

## Issue

The Auth0 authorization URLs are malformed because React apps require environment variables to be prefixed with `REACT_APP_`.

## Current Netlify Variables (need to be updated)

- `AUTH0_DOMAIN` → `REACT_APP_AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID` → `REACT_APP_AUTH0_CLIENT_ID`
- `AUTH0_AUDIENCE` → `REACT_APP_AUTH0_AUDIENCE`

## Steps to Fix

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add new variables with `REACT_APP_` prefix:
   - `REACT_APP_AUTH0_DOMAIN` = [your current AUTH0_DOMAIN value]
   - `REACT_APP_AUTH0_CLIENT_ID` = [your current AUTH0_CLIENT_ID value]
   - `REACT_APP_AUTH0_AUDIENCE` = [your current AUTH0_AUDIENCE value]
3. Keep the old variables as fallback (optional)
4. Redeploy the site

## Verification

After updating, the authorization URL should be:

```
https://[your-tenant].auth0.com/authorize?client_id=[actual-client-id]&scope=openid+profile+email&redirect_uri=https://expense-tracker-alfred.netlify.app&audience=[actual-audience]&...
```
