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
    active: boolean;
  }): Promise<void> {
    const token = await keycloakAdmin.getAdminToken();
    const createUserEndpoint = `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}/admin/realms/${ConfigService.getInstance().keycloak.realm}/users`;

    try {
      logger.info(`Service is creating user '${userData.username}'...`);
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
          attributes: { //Assign here new variables.
            active: userData.active.toString(), // Convert boolean to string, as keycloak only saves strings
          },
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

  static async findUserByUsername(username: string): Promise<any | null> {
    const token = await keycloakAdmin.getAdminToken();
    // Note the `exact=true` to avoid partial matches
    const findUserEndpoint = `http://${ConfigService.getInstance().keycloak.host}:${ConfigService.getInstance().keycloak.port}/admin/realms/${ConfigService.getInstance().keycloak.realm}/users?exact=true&username=${username}`;

    try {
      const response = await axios.get(findUserEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.length > 0) {
        return response.data[0]; // Return the first (and only) match
      }
      return null;
    } catch (error: any) {
      logger.error(`Failed to find user '${username}' in Keycloak`, {
        error: error.response?.data || error.message,
      });
      throw new Error(error.response?.data?.errorMessage || 'User lookup failed.');
    }
  }

}