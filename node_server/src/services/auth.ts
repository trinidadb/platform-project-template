import { Issuer, Client, generators, TokenSet } from "openid-client";
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
      const keycloakUrl = `http://${config.host}:${config.port}`;
      
      const issuer = await Issuer.discover(`${keycloakUrl}/realms/${config.realm}`);

      this.client = new issuer.Client({
        client_id: config.client,
        client_secret: config.clientSecret,
        redirect_uris: ["http://localhost:8083/auth/callback"], 
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

  // 4. Handle Callback (Exchange Code for Token)
  public async exchangeCodeForToken(req: Request, code_verifier: string): Promise<TokenSet> {
    const client = this.getClient();
    const params = client.callbackParams(req);
    
    return await client.callback(
      "http://localhost:8083/auth/callback", 
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
        post_logout_redirect_uri: "http://localhost:8083/",
      });
    }
    
    return "http://localhost:8083/"; // Fallback
  }

  // 6. Refresh Token (Used by Middleware)
  public async refreshToken(tokenSet: TokenSet): Promise<TokenSet> {
    const client = this.getClient();
    return await client.refresh(tokenSet);
  }
}
