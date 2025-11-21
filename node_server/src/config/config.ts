import dotenv from "dotenv";
import path from "path";
import logger from "./logger";
import { IHttpOptions, IHttpsOptions, IKeycloakOptions, IPostgresOptions } from "./interfaces";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Helper functions to enforce strictness. All variables should be defined in .env
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`[CONFIG ERROR] Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string): number {
  const value = getEnv(key);
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`[CONFIG ERROR] Environment variable ${key} must be a number, got: ${value}`);
  }
  return num;
}

// Constructors
export class HttpConfig {
  public port: number;
  public bind: string;
  public keyCloakRedirectURI: string;

  constructor(opts: IHttpOptions) {
    this.port = opts.port;
    this.bind = opts.bind;
    this.keyCloakRedirectURI = `http://${this.bind}:${this.port}/`;
  }
}

export class HttpsConfig extends HttpConfig {
  public caFile: string;
  public keyFile: string;
  public certFile: string;

  constructor(opts: IHttpsOptions) {
    super(opts);
    this.caFile = opts.caFile;
    this.keyFile = opts.keyFile;
    this.certFile = opts.certFile;
  }
}

export class PostgresConfig {
  public user: string;
  public host: string;
  public database: string;
  public password: string;
  public port: number;

  constructor(opts: IPostgresOptions) {
    this.user = opts.user;
    this.host = opts.host;
    this.database = opts.database;
    this.password = opts.password;
    this.port = opts.port;
  }
}

export class KeycloakConfig {
  public host: string;
  public port: number;
  public realm: string;
  public client: string;
  public clientSecret: string;
  public issuerHost: string;
  public issuerPort: number;

  constructor(opts: IKeycloakOptions) {
    this.host = opts.host;
    this.port = opts.port;
    this.realm = opts.realm;
    this.client = opts.client;
    this.clientSecret = opts.clientSecret;
    this.issuerHost = opts.issuerHost;
    this.issuerPort = opts.issuerPort;
  }
}

// export class S3Config {
//   public region: string;
//   public bucket: string;
//   public accessKeyId: string;
//   public secretAccessKey: string;

//   constructor(configObj: Partial<S3Config>) {
//     this.region = configObj.region;
//     this.bucket = configObj.bucket;
//     this.accessKeyId = configObj.accessKeyId;
//     this.secretAccessKey = configObj.secretAccessKey;
//   }
// }


// Main Config Loader
export class Config {
  public redirect: boolean;
  public http: HttpConfig;
  public https: HttpsConfig;
  public db: PostgresConfig;
  public keycloak: KeycloakConfig;

  private constructor(
    redirect: boolean,
    http: HttpConfig,
    https: HttpsConfig,
    db: PostgresConfig,
    keycloak: KeycloakConfig
  ) {
    this.redirect = redirect;
    this.http = http;
    this.https = https;
    this.db = db;
    this.keycloak = keycloak;
  }

  static loadFromEnv(): Config {
    try {
      const isTestEnv = getEnv("APP_ENV") === "test";
      const isDnsEnabled = getEnv("DNS_ENABLED") === "true";
      const redirect = process.env.REDIRECT === "true"; //Doesn't force that variable to be defined in .env

      const keyCloakIssuerHost = process.env.KEYCLOAK_ISSUER_HOST ? getEnv("KEYCLOAK_ISSUER_HOST") : getEnv("KEYCLOAK_HOST");
      const keyCloakIssuerPort = process.env.KEYCLOAK_ISSUER_PORT ? getEnvNumber("KEYCLOAK_ISSUER_PORT") : getEnvNumber("KEYCLOAK_PORT");

      const http = new HttpConfig({
        port: getEnvNumber("HTTP_PORT"),
        bind: isDnsEnabled ? getEnv("DNS_SERVER") : getEnv("HTTP_BIND"),
      });

      const https = new HttpsConfig({
        port: getEnvNumber("HTTPS_PORT"),
        bind: isDnsEnabled ? getEnv("DNS_SERVER") : getEnv("HTTPS_BIND"),
        keyFile: getEnv("HTTPS_KEY_FILE"),
        certFile: getEnv("HTTPS_CERT_FILE"),
        caFile: getEnv("HTTPS_CA_FILE"),
      });

      const db = new PostgresConfig({
        user: getEnv("POSTGRES_USER"),
        password: getEnv("POSTGRES_PASSWORD"),
        host: isTestEnv ? getEnv("POSTGRES_TEST_HOST") : getEnv("POSTGRES_HOST"),
        port: isTestEnv ? getEnvNumber("POSTGRES_TEST_PORT") : getEnvNumber("POSTGRES_PORT"),
        database: isTestEnv ? `${getEnv("POSTGRES_DB")}_test` : getEnv("POSTGRES_DB"),
      });

      const keycloak = new KeycloakConfig({
        host: getEnv("KEYCLOAK_HOST"),
        port: getEnvNumber("KEYCLOAK_PORT"),
        realm: getEnv("KEYCLOAK_REALM_NAME"),
        client: getEnv("KEYCLOAK_CLIENT_NAME"),
        clientSecret: getEnv("KEYCLOAK_CLIENT_SECRET"),
        issuerHost: isDnsEnabled ? getEnv("DNS_SERVER") : keyCloakIssuerHost,
        issuerPort: keyCloakIssuerPort,
      });

      return new Config(redirect, http, https, db, keycloak);

    } catch (error: any) {
        logger.error(error.message, { error });
        process.exit(1);
    }
  }
}

export class ConfigService {
  private static instance: Config;

  static getInstance(): Config {
    return (this.instance ??= Config.loadFromEnv());
  }
}
