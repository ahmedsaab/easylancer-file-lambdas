import IIndexService, {Index, IndexId, isDefined, lessThan, oneOf, Selector, UserId} from "./interfaces/index-service";
import { connect } from "../db";
import { FilterQuery, InsertOneWriteOpResult, ObjectID, UpdateWriteOpResult } from "mongodb";

export class MongodbIndexService implements IIndexService {
  private collection: string;

  constructor(collectionName: string) {
    this.collection = collectionName;
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
    const db = await connect();
    const index: Partial<Index> = {
      userId,
      url: null,
      key: null,
      uploaded: false,
      expiresAt,
    };

    return db.collection(this.collection)
      .insertOne(index)
      .then((output: InsertOneWriteOpResult) =>
        output.insertedId.toHexString()
      );
  }

  async updateIndex(id: IndexId, updates: Partial<Index>) {
    const db = await connect();

    return db.collection(this.collection).updateOne(
      { _id: new ObjectID(id) },
      { $set: updates }
    );
  }

  async updateIndexes(selector: Selector, updates: Partial<Index>): Promise<number> {
    const db = await connect();

    return db.collection(this.collection).updateMany(
      this.getQuery(selector),
      { $set: updates },
    ).then((output: UpdateWriteOpResult) => output.matchedCount);
  }

  async queryIndex(selector: Selector): Promise<Array<Index>> {
    const db = await connect();

    return db.collection(this.collection)
      .find(this.getQuery(selector))
      .toArray()
      .then((files) => files.map(file => ({
        ...file,
        id: file._id,
        _id: undefined,
      })));
  }

  async deleteIndexes(selector: Selector): Promise<number> {
    const db = await connect();

    return db.collection(this.collection).deleteMany(this.getQuery(selector))
      .then(({ deletedCount }) => deletedCount);
  }
}

export default new MongodbIndexService('files');
