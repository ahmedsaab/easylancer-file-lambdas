import * as moment from 'moment';
import MongodbIndexService from "../services/mongodb.index-service";
import S3StorageService from '../services/s3.storage-service'
import { lessThan, oneOf } from "../services/interfaces/index-service";

export default async (event) => {
  try {
    const now = moment().toISOString();

    const expiredFiles = await MongodbIndexService.queryIndex({
      expiresAt: new lessThan(now),
    });

    const storageDeleteResp = await S3StorageService.deleteFiles(
      expiredFiles.filter(file => file.uploaded).map(file => file.key)
    );

    const [ deleted, removed ] = await Promise.all([
      MongodbIndexService.deleteIndexes({
        key: new oneOf(storageDeleteResp.deleted)
      }),
      MongodbIndexService.deleteIndexes({
        id: new oneOf(expiredFiles.filter(file => !file.uploaded).map(file => file.id))
      })
    ]);

    console.log({ deleted, removed, errored: storageDeleteResp.errored });
  } catch (error) {
    console.error(error)
  }

};
