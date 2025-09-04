import dotenv from "dotenv";
import path from "path";
import { logger } from ".";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export class HttpConfig {
  public port: number;
  public bind: string;

  constructor(configObj: Partial<HttpConfig>) {
    this.port = configObj.port;
    this.bind = configObj.bind;
  }
}

export class HttpsConfig extends HttpConfig {
  public caFile: string;
  public keyFile: string;
  public certFile: string;

  constructor(configObj: Partial<HttpsConfig>) {
    super(configObj);
    this.caFile = configObj.caFile;
    this.keyFile = configObj.keyFile;
    this.certFile = configObj.certFile;
  }
}

export class PostgresConfig {
  public user: string;
  public host: string;
  public database: string;
  public password: string;
  public port: number;

  constructor(configObj: Partial<PostgresConfig>) {
    this.user = configObj.user;
    this.host = configObj.host;
    this.database = configObj.database;
    this.password = configObj.password;
    this.port = configObj.port;
  }
}

export class DnsConfig {
  public enabled: boolean;
  public server: string;

  constructor(configObj: Partial<DnsConfig>) {
    this.enabled = configObj.enabled ?? false;
    this.server = configObj.server;
  }
}

export class KeycloakConfig {
  public host: string;
  public port: string;
  public realm: string;
  public client: string;
  public clientSecret: string;

  constructor(configObj: Partial<KeycloakConfig>) {
    this.host = configObj.host;
    this.port = configObj.port;
    this.realm = configObj.realm;
    this.client = configObj.client;
    this.clientSecret = configObj.clientSecret;
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

export class Config {
  public redirect: boolean;
  public http: HttpConfig;
  public https: HttpsConfig;
  public db: PostgresConfig;
  public dns: DnsConfig;
  public keycloak: KeycloakConfig;
  //  public s3: S3Config;

  private constructor(configObj: Partial<Config>) {
    this.redirect = configObj.redirect ?? false;
    this.http = new HttpConfig(configObj.http);
    this.https = new HttpsConfig(configObj.https);
    this.db = new PostgresConfig(configObj.db);
    this.dns = new DnsConfig(configObj.dns);
    this.keycloak = new KeycloakConfig(configObj.keycloak)
    //    this.s3 = new S3Config(configObj.s3);
  }

  static loadFromEnv(): Config {
    try {
      const isTestEnv = process.env.NODE_ENV === 'test';

      const configObj: Partial<Config> = {
        redirect: process.env.REDIRECT === "true",
        http: {
          port: process.env.HTTP_PORT
            ? Number(process.env.HTTP_PORT)
            : undefined,
          bind: process.env.HTTP_BIND,
        },
        https: {
          port: process.env.HTTPS_PORT
            ? Number(process.env.HTTPS_PORT)
            : undefined,
          bind: process.env.HTTPS_BIND,
          keyFile: process.env.HTTPS_KEY_FILE,
          certFile: process.env.HTTPS_CERT_FILE,
          caFile: process.env.HTTPS_CA_FILE,
        },
        db: {
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          host: isTestEnv ? process.env.POSTGRES_TEST_HOST : process.env.POSTGRES_HOST,
          port: isTestEnv ? Number(process.env.POSTGRES_TEST_PORT) : Number(process.env.POSTGRES_PORT),
          database: isTestEnv ? `${process.env.POSTGRES_DB}_test` : process.env.POSTGRES_DB,
        },
        dns: {
          enabled: process.env.DNS_ENABLED === "true",
          server: process.env.DNS_SERVER,
        },
        keycloak: {
          host: process.env.KEYCLOAK_HOST,
          port: process.env.KEYCLOAK_PORT,
          realm: process.env.KEYCLOAK_REALM_NAME,
          client: process.env.KEYCLOAK_CLIENT_NAME,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        },
        // s3: {
        //   region: process.env.AWS_REGION,
        //   bucket: process.env.AWS_S3_BUCKET_NAME,
        //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        // },
      };

      return new Config(configObj);
    } catch (error) {
      logger.error("[CONFIG] Failed to load config from environment", {
        error,
      });
      return new Config({});
    }
  }
}

export class ConfigService {
  private static instance: Config;

  static getInstance(): Config {
    return (this.instance ??= Config.loadFromEnv());
  }
}
