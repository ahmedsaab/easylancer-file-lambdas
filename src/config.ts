import * as Joi from 'joi';

interface IConfig {
  MONGO_DB_URI: string,
  AWS_BUCKET: string;
  MONGO_DB_NAME: string;
  ISSUER_URL: string;
  TTL: number,
}

const obj = {
  MONGO_DB_URI: Joi.string().required(),
  MONGO_DB_NAME: Joi.string().required(),
  AWS_BUCKET: Joi.string().required(),
  ISSUER_URL: Joi.string().required(),
  TTL: Joi.number().required(),
};
const schema = Joi.object(obj);
const config: IConfig = {
  MONGO_DB_URI: null,
  MONGO_DB_NAME: null,
  AWS_BUCKET: null,
  ISSUER_URL: null,
  TTL: null,
};

Object.keys(obj).forEach((key) => { config[key] = process.env[key]; });

const { error } = Joi.validate(
  config,
  schema,
);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default config;
