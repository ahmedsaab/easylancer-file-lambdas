import config from './config';
import { MongoClient, Db } from 'mongodb';

let db: Db = null;

// eslint-disable-next-line import/prefer-default-export
export const connect = async () => {
  if (db) {
    return db;
  }
  const connection = await MongoClient.connect(config.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  db = connection.db(config.MONGO_DB_NAME);
  return db;
};
