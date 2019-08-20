import Storage from '../services/s3.storage-service'
import Indexer from '../services/mongodb.index-service'
import { generateErrorResponse, generateSuccessResponse } from "../http/http-response-factory";
import config from "../config";
import * as moment from "moment";

export default async (event) => {
  try {
    const userId = '234';
    const expiresAt = moment().add(config.TTL, 'minutes').toISOString();
    const indexId = await Indexer.create(userId, expiresAt);
    const filePath = `${userId}/${indexId}`;
    const resp = await Storage.requestSignedPost(filePath);

    await Indexer.updateById(indexId,{
      url: resp.download.url,
      key: filePath
    });

    return generateSuccessResponse(resp);
  } catch (error) {
    console.error(error);

    return generateErrorResponse(error);
  }
};
