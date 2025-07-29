import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "./auth0-config";

interface Auth0ProviderWithHistoryProps {
  children: React.ReactNode;
}

const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistoryProps> = ({
  children,
}) => {
  const onRedirectCallback = (appState: any) => {
    // Simple redirect handling without router
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation={auth0Config.cacheLocation}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
