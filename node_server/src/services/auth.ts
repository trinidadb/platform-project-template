import { Issuer, Client, TokenSet } from "openid-client";
import { ConfigService, logger } from "../config";

class AuthService {
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
      const keycloakUrl = `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}`;
      const realm = ConfigService.getInstance().keycloak.realm;
      
      const issuer = await Issuer.discover(`${keycloakUrl}/realms/${realm}`);

      this.client = new issuer.Client({
        client_id: ConfigService.getInstance().keycloak.client,
        client_secret: ConfigService.getInstance().keycloak.clientSecret,
        redirect_uris: ["http://localhost:8083/auth/callback"], 
        response_types: ["code"],
      });
      
      logger.info("AuthService: OIDC Client initialized");
    } catch (error) {
      logger.error("AuthService: Failed to initialize", { error });
      throw error;
    }
  }
  
  // Helper to refresh token
  public async refreshToken(tokenSet: TokenSet): Promise<TokenSet> {
    if (!this.client) throw new Error("OIDC Client not initialized");
    return await this.client.refresh(tokenSet);
  }
}

export const authService = AuthService.getInstance();