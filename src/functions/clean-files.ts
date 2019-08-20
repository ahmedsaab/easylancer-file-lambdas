import * as moment from 'moment';
import Indexer from "../services/mongodb.index-service";
import Storage from '../services/s3.storage-service'
import { lessThan, oneOf } from "../services/interfaces/index-service";

export default async () => {
  try {
    const now = moment().toISOString();

    const expiredFiles = await Indexer.query({
      expiresAt: new lessThan(now),
    });

    const storageDeleteResp = await Storage.delete(
      expiredFiles
        .filter(file => file.uploaded)
        .map(file => file.key)
    );

    const [ deleted, removed ] = await Promise.all([
      Indexer.delete({
        key: new oneOf(storageDeleteResp.deleted)
      }),
      Indexer.delete({
        id: new oneOf(expiredFiles
          .filter(file => !file.uploaded)
          .map(file => file.id)
        )
      })
    ]);

    console.log({
      deleted,
      removed,
      errored: storageDeleteResp.errored
    });
  } catch (error) {
    console.error(error)
  }
};
