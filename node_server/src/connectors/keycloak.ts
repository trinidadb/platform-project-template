import axios from 'axios';
import { ConfigService } from '../config';
import { URLSearchParams } from 'url';
import { logger } from '../config';


class KeycloakAdminConnector {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Gets a valid admin access token for making API calls.
   * It caches the token and refreshes it when it's about to expire.
   */
  public async getAdminToken(): Promise<string> {
    // If we have a valid, non-expired token, return it.
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    logger.info('Fetching new Keycloak admin token...');
    try {
      const tokenEndpoint = `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}/realms/${ConfigService.getInstance().keycloak.realm}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', ConfigService.getInstance().keycloak.client);
      params.append('client_secret', ConfigService.getInstance().keycloak.clientSecret);

      const response = await axios.post(tokenEndpoint, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const tokenData = response.data;
      this.accessToken = tokenData.access_token;
      // Set expiration to 60 seconds before it actually expires to be safe
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
      
      logger.info('Successfully fetched Keycloak admin token.');
      return this.accessToken!;
    } catch (error: any) {
      logger.error('Failed to fetch Keycloak admin token', { 
        error: error.response?.data || error.message 
      });
      throw new Error('Could not authenticate with Keycloak as admin.');
    }
  }
}

// Export a singleton instance of the connector
export const keycloakAdmin = new KeycloakAdminConnector();