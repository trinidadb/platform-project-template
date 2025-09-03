import axios from 'axios';
import { URLSearchParams } from 'url';
import { logger } from '../config';

const keycloakBaseUrl = 'http://localhost:8180'; // Use Docker service name
const realmName = 'my-app-realm';
const clientId = 'my-node-app';
const clientSecret = 'AbCdEfGhIjKlMnOpQrStUvWxYz123456'; // Get this from Client->Credentials tab in Keycloak


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
      const tokenEndpoint = `${keycloakBaseUrl}/realms/${realmName}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

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