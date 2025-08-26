import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

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

export class S3Config {
  public region: string;
  public bucket: string;
  public accessKeyId: string;
  public secretAccessKey: string;

  constructor(configObj: Partial<S3Config>) {
    this.region = configObj.region;
    this.bucket = configObj.bucket;
    this.accessKeyId = configObj.accessKeyId;
    this.secretAccessKey = configObj.secretAccessKey;
  }
}

export class Config {
  public redirect: boolean;
  public http: HttpConfig;
  public https: HttpsConfig;
  public db: PostgresConfig;
  public s3: S3Config;

  private constructor(configObj: Partial<Config>) {
    this.redirect = configObj.redirect ?? false;
    this.http = new HttpConfig(configObj.http);
    this.https = new HttpsConfig(configObj.https);
    this.db = new PostgresConfig(configObj.db);
    this.s3 = new S3Config(configObj.s3);
  }

  static loadFromEnv(): Config {
    try {
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
          host: process.env.POSTGRES_HOST,
          port: process.env.POSTGRES_PORT
            ? Number(process.env.POSTGRES_PORT)
            : undefined,
          database: process.env.POSTGRES_DB,
        },
        s3: {
          region: process.env.AWS_REGION,
          bucket: process.env.AWS_S3_BUCKET_NAME,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      };

      return new Config(configObj);
    } catch (error) {
      console.error("[CONFIG] Failed to load config from environment:", error);
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
