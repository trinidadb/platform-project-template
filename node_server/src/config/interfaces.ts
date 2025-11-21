// The Interfaces (Strict Inputs) --> what must be passed to the constructors
export interface IHttpOptions {
  port: number;
  bind: string;
}

export interface IHttpsOptions extends IHttpOptions {
  caFile: string;
  keyFile: string;
  certFile: string;
}

export interface IPostgresOptions {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export interface IKeycloakOptions {
  host: string;
  port: number;
  realm: string;
  client: string;
  clientSecret: string;
  issuerHost: string;
  issuerPort: number;
}