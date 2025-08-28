import { Client } from 'pg';
import { Sequelize } from "sequelize";
import { ConfigService } from '../config';

export class PostgresSingleton {
  private static instance: PostgresSingleton;
  private client: Client;

  private constructor() {
    const config = ConfigService.getInstance().db;
    this.client = new Client({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port,
    });
  }

  static async getInstance(): Promise<PostgresSingleton> {
    if (!this.instance) {
      this.instance = new PostgresSingleton();
      try {
        await this.instance.client.connect();
        console.log("Connected to Postgres");
      } catch (error) {
        console.error("Failed to connect to Postgres:", error);
        throw error;
      }
    }
    return this.instance;
  }

  getClient(): Client {
    return this.client;
  }
}


class PostgresSingletonSequelize {
  private static instance: Sequelize;

  private constructor() {} // Evita instanciación directa

  public static getInstance(): Sequelize {
    if (!PostgresSingletonSequelize.instance) {
      const config = ConfigService.getInstance().db;
      PostgresSingletonSequelize.instance = new Sequelize({
        dialect: "postgres",
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password:config.password,
        logging: false, // Desactiva logs SQL
      });
      console.log(" PostgreSQL Singleton creado.");
    }
    return PostgresSingletonSequelize.instance;
  }
}

export const postgresDbClient = PostgresSingleton.getInstance();
export const postgresDbConnector = PostgresSingletonSequelize.getInstance();