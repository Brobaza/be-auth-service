import { readFileSync } from 'fs';
import * as joi from 'joi';
import { load } from 'js-yaml';

export interface Configuration {
  port: number;
  isProd: boolean;
  prefix: string;
  version: string;
  grpcUrl: string;

  frontendUrl: string;
  verificationPath: {
    register: string;
    resetPassword: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    database: number;
    prefix: string;
  };
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  agenda: {
    uri: string;
    collection: string;
    database: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    from: string;
  };
  verificationExpiresIn: {
    register: number;
    resetPassword: number;
  };
  jwt: {
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
  };
  mongo: {
    uri: string;
    username: string;
    password: string;
    port: number;
  };
  kafka: {
    brokers: string[];
    groupId: string;
    topics: {
      name: string;
      partitions: number;
      replicationFactor: number;
    }[];
  };
  services: {
    auth: {
      port: string;
      prefix: string;
      version: string;
      container_name: string;
    };
    user: {
      port: string;
      prefix: string;
      version: string;
      container_name: string;
    };
    mail: {
      port: string;
      prefix: string;
      version: string;
      container_name: string;
    };
    chat: {
      port: string;
      prefix: string;
      version: string;
      container_name: string;
    };
  };
  redisLock: {
    driftFactor: number;
    retryJitter: number;
    retryCount: number;
    retryDelay: number;
  };
  verification: {
    enable_default_code: boolean;
    length: {
      code: number;
      token: number;
    };
    limit_time: number;
    register: {
      expires_in: number;
      path: string;
    };
    reset_password: {
      expires_in: number;
      path: string;
    };
  };
}

const redisLockSchema = joi.object({
  driftFactor: joi.number().required(),
  retryJitter: joi.number().required(),
  retryCount: joi.number().required(),
  retryDelay: joi.number().required(),
});

const redisSchema = joi.object({
  host: joi.string().required(),
  port: joi.number().required(),
  password: joi.string().required().allow(''),
  database: joi.number().required(),
  prefix: joi.string().required(),
});

const postgresSchema = joi.object({
  host: joi.string().required(),
  port: joi.number().required(),
  username: joi.string().required(),
  password: joi.string().required(),
  database: joi.string().required(),
});

const agendaSchema = joi.object({
  uri: joi.string().required(),
  collection: joi.string().required(),
  database: joi.string().required(),
});

const smtpSchema = joi.object({
  host: joi.string().required(),
  port: joi.number().required(),
  secure: joi.boolean().required(),
  username: joi.string().required().allow(''),
  password: joi.string().required().allow(''),
  from: joi.string().required(),
});

const verificationExpiresInSchema = joi.object({
  register: joi.number().required(),
  resetPassword: joi.number().required(),
});

const jwtSchema = joi.object({
  accessTokenExpiresIn: joi.number().required(),
  refreshTokenExpiresIn: joi.number().required(),
});

const verificationPathSchema = joi.object({
  register: joi.string().required(),
  resetPassword: joi.string().required(),
});

const mongoSchema = joi.object({
  uri: joi.string().required(),
  username: joi.string().required(),
  password: joi.string().required(),
  port: joi.number().required(),
});

const kafkaSchema = joi.object({
  brokers: joi.array().items(joi.string().uri()).required(),
  groupId: joi.string().required(),
  topics: joi
    .array()
    .items(
      joi.object({
        name: joi.string().required(),
        partitions: joi.number().integer().min(1).required(),
        replicationFactor: joi.number().integer().min(1).required(),
      }),
    )
    .required(),
});

const servicesSchema = joi.object({
  auth: joi.object({
    port: joi.string().required(),
    prefix: joi.string().required(),
    version: joi.string().required(),
    container_name: joi.string().required(),
  }),
  user: joi.object({
    port: joi.string().required(),
    prefix: joi.string().required(),
    version: joi.string().required(),
    container_name: joi.string().required(),
  }),
  mail: joi.object({
    port: joi.string().required(),
    prefix: joi.string().required(),
    version: joi.string().required(),
    container_name: joi.string().required(),
  }),
  chat: joi.object({
    port: joi.string().required(),
    prefix: joi.string().required(),
    version: joi.string().required(),
    container_name: joi.string().required(),
  }),
});

const verificationSchema = joi.object({
  enable_default_code: joi.boolean().required(),
  length: joi.object({
    code: joi.number().required(),
    token: joi.number().required(),
  }),
  limit_time: joi.number().required(),
  register: joi.object({
    expires_in: joi.number().required(),
    path: joi.string().required(),
  }),
  reset_password: joi.object({
    expires_in: joi.number().required(),
    path: joi.string().required(),
  }),
});

const configSchema = joi.object<Configuration>({
  port: joi.number().required(),
  isProd: joi.boolean().required(),
  prefix: joi.string().required(),
  version: joi.string().required(),
  grpcUrl: joi.string().required(),

  frontendUrl: joi.string().required(),
  verificationPath: verificationPathSchema.required(),

  redis: redisSchema.required(),
  postgres: postgresSchema.required(),
  agenda: agendaSchema.required(),
  smtp: smtpSchema.required(),
  verificationExpiresIn: verificationExpiresInSchema.required(),
  jwt: jwtSchema.required(),
  mongo: mongoSchema.required(),
  kafka: kafkaSchema.required(),
  services: servicesSchema.required(),
  redisLock: redisLockSchema.required(),
  verification: verificationSchema.required(),
});

export const loadConfiguration = (): Configuration => {
  const config = load(readFileSync('config.yml', 'utf8')) as Record<
    string,
    any
  >;

  const { value, error } = configSchema.validate(config, { abortEarly: true });

  if (error) {
    throw new Error(error.message);
  }

  return value;
};
