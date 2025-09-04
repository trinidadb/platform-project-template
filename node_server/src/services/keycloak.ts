// src/services/keycloakAdminService.ts
import axios from 'axios';
import { ConfigService } from "../config";
import { keycloakAdmin } from '../connectors';
import { logger } from '../config';


export class KeycloakAdminService {

  static async createUser(userData: {
    username: string;
    email: string;
    name: string;
    lastname: string;
    password: string;
  }): Promise<void> { // We can make this void since we don't return the user data
    // 1. Get the admin token from the connector
    const token = await keycloakAdmin.getAdminToken();
    const createUserEndpoint = `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}/admin/realms/${ConfigService.getInstance().keycloak.realm}/users`;

    try {
      logger.info(`Service is creating user '${userData.username}'...`);
      // 2. Use the token to perform the business logic
      await axios.post(
        createUserEndpoint,
        {
          username: userData.username,
          email: userData.email,
          firstName: userData.name,
          lastName: userData.lastname,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: userData.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      logger.info(`User '${userData.username}' created successfully.`);
    } catch (error: any) {
      logger.error(`Failed to create user '${userData.username}' in Keycloak`, {
        error: error.response?.data || error.message
      });
      throw new Error(error.response?.data?.errorMessage || 'User creation failed.');
    }
  }

}