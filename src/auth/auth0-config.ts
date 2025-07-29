export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || process.env.AUTH0_DOMAIN || "",
  clientId:
    process.env.REACT_APP_AUTH0_CLIENT_ID || process.env.AUTH0_CLIENT_ID || "",
  audience:
    process.env.REACT_APP_AUTH0_AUDIENCE || process.env.AUTH0_AUDIENCE || "",
  redirectUri: window.location.origin,
  cacheLocation: "localstorage" as const,
};

// Validate configuration
export const validateAuth0Config = () => {
  const required = ["domain", "clientId", "audience"];
  const missing = required.filter(
    (key) => !auth0Config[key as keyof typeof auth0Config]
  );

  if (missing.length > 0) {
    console.warn("Missing Auth0 configuration:", missing);
    return false;
  }

  return true;
};
