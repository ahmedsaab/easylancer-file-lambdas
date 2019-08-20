import IIndexService, { Index, IndexId, isDefined, lessThan, oneOf, Selector, UserId } from "./interfaces/index-service";
import { Db, FilterQuery, InsertOneWriteOpResult, MongoClient, ObjectID, UpdateWriteOpResult } from "mongodb";
import config from "../config";

export class MongodbIndexService implements IIndexService {
  private collection: string;
  private db: Db = null;

  constructor(collectionName: string) {
    this.collection = collectionName;
  }

  private async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }
    const connection = await MongoClient.connect(config.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.db = connection.db(config.MONGO_DB_NAME);
  }

  private getQuery(selector: Selector): FilterQuery<object> {
    const query = {};

    Object.keys(selector).forEach(key => {
      if(selector[key] instanceof oneOf) {
        query[key === 'id' ? '_id' : key] = {
          $in: (selector[key] as oneOf)
            .values.map( v => key === 'id' ? new ObjectID(v) : v)
        }
      } else if (selector[key] instanceof isDefined) {
        query[key] = { $exists: (selector[key] as isDefined).value }
      } else if (selector[key] instanceof lessThan) {
        query[key] = { $lt : (selector[key] as lessThan).value }
      } else {
        query[key === 'id' ? '_id' : key] = selector[key];
      }
    });

    return query;
  }

  async createIndex(userId: UserId, expiresAt: string): Promise<IndexId> {
    await this.connect();

    const index: Partial<Index> = {
      userId,
      url: null,
      key: null,
      uploaded: false,
      expiresAt,
    };

    return this.db.collection(this.collection)
      .insertOne(index)
      .then((output: InsertOneWriteOpResult) =>
        output.insertedId.toHexString()
      );
  }

  async updateIndex(id: IndexId, updates: Partial<Index>) {
    await this.connect();

    return this.db.collection(this.collection).updateOne(
      { _id: new ObjectID(id) },
      { $set: updates }
    );
  }

  async updateIndexes(selector: Selector, updates: Partial<Index>): Promise<number> {
    await this.connect();

    return this.db.collection(this.collection).updateMany(
      this.getQuery(selector),
      { $set: updates },
    ).then((output: UpdateWriteOpResult) => output.matchedCount);
  }

  async queryIndex(selector: Selector): Promise<Array<Index>> {
    await this.connect();

    return this.db.collection(this.collection)
      .find(this.getQuery(selector))
      .toArray()
      .then((files) => files.map(file => ({
        ...file,
        id: file._id,
        _id: undefined,
      })));
  }

  async deleteIndexes(selector: Selector): Promise<number> {
    await this.connect();

    return this.db.collection(this.collection).deleteMany(this.getQuery(selector))
      .then(({ deletedCount }) => deletedCount);
  }
}

export default new MongodbIndexService('files');
