import { Issuer, Client, generators, TokenSet, custom } from "openid-client";
import { ConfigService, logger } from "../config";
import { Request } from "express";

export class AuthService {
  private static instance: AuthService;
  public client: Client | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async initialize() {
    if (this.client) return; // Already initialized

    try {
      const config = ConfigService.getInstance().keycloak;

      // Use INTERNAL URL for server-to-Keycloak discovery
      const internalKeycloakUrl = `http://${config.host}:${config.port}`;

      // Build external URLs for redirects (what the browser sees)
      const externalKeycloakUrl = `http://${config.issuerHost}:${config.issuerPort}`;
      const callbackUrl = `${ConfigService.getInstance().http.keyCloakRedirectURI}auth/callback`;

      const discoveredIssuer = await Issuer.discover(`${internalKeycloakUrl}/realms/${config.realm}`);
      let issuer = discoveredIssuer;

      // --- FIX FOR RUNNING IN DOCKER: SWAP INTERNAL URL WITH PUBLIC URL ---
      // Before (the problem):
      //   Internal (Docker): Your Node app (inside Docker) successfully talks to Keycloak (inside Docker) using the hostname keycloak. That's why your logs show OIDC Client initialized.
      //   External (Browser): Your Node app generates a Redirect URL based on what it knows (http://keycloak:8080/...) and sends it to the browser.
      //   The Crash: Your Browser (on your physical machine) tries to go to http://keycloak:8080. Your computer has no idea what keycloak is (it doesn't exist in your DNS/Hosts file), so it crashes with ERR_NAME_NOT_RESOLVED.
      // The docker 'url' looks like: http://keycloak:8080/realms/...
      // We need it to look like:     http://localhost:8180/realms/...
      if (internalKeycloakUrl != externalKeycloakUrl){
        logger.info("Resorting to create custom issuer/client");
        issuer = new Issuer({
          ...discoveredIssuer.metadata,
          issuer: `${externalKeycloakUrl}/realms/${config.realm}`,
          
          // Browser-facing endpoints (external URLs)
          authorization_endpoint: `${externalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/auth`,
          end_session_endpoint: `${externalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/logout`,
          
          // Server-facing endpoints (internal URLs - faster, direct communication)
          token_endpoint: `${internalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/token`,
          userinfo_endpoint: `${internalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/userinfo`,
          jwks_uri: `${internalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/certs`,
          revocation_endpoint: `${internalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/revoke`,
          introspection_endpoint: `${internalKeycloakUrl}/realms/${config.realm}/protocol/openid-connect/token/introspect`,
        });
      }

      this.client = new issuer.Client({
        client_id: config.client,
        client_secret: config.clientSecret,
        redirect_uris: [callbackUrl], 
        response_types: ["code"],
      });

      logger.info("AuthService: OIDC Client initialized");
    } catch (error) {
      logger.error("AuthService: Failed to initialize", { error });
      throw error;
    }
  }
  
  // 2. Get Client Instance (Guard)
  public getClient(): Client {
    if (!this.client) {
      throw new Error("OIDC Client not initialized. Call initialize() first.");
    }
    return this.client;
  }

// 3. Generate Login URL and PKCE Challenge
  public generateLoginUrl() {
    const client = this.getClient();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    const url = client.authorizationUrl({
      scope: "openid profile email",
      code_challenge,
      code_challenge_method: "S256",
    });

    return { url, code_verifier };
  }

  public async exchangeCodeForToken(req: Request, code_verifier: string): Promise<TokenSet> {
    const client = this.getClient();
    const params = client.callbackParams(req);
    
    return await client.callback(
      `${ConfigService.getInstance().http.keyCloakRedirectURI}auth/callback`, 
      params, 
      { code_verifier }
    );
  }

  // 5. Get Logout URL
  public getLogoutUrl(id_token_hint?: string): string {
    const client = this.getClient();
    
    // If we have an ID token, we hint it to Keycloak for a smoother logout
    if (id_token_hint) {
      return client.endSessionUrl({
        id_token_hint,
        post_logout_redirect_uri: ConfigService.getInstance().http.keyCloakRedirectURI,
      });
    }
    
    return ConfigService.getInstance().http.keyCloakRedirectURI; // Fallback
  }

  // 6. Refresh Token (Used by Middleware)
  public async refreshToken(tokenSet: TokenSet): Promise<TokenSet> {
    const client = this.getClient();
    return await client.refresh(tokenSet);
  }
}
