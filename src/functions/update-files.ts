import * as moment from 'moment';
import MongodbIndexService from '../services/mongodb.index-service'
import { oneOf } from "../services/interfaces/index-service";
import { generateErrorResponse, generateSuccessResponse } from "../http/http-response-factory";
import * as createHttpError from "http-errors";
import config from "../config";

export default async (event) => {
  try {
    const { urls, confirm } = JSON.parse(event.body.toString());

    const filesCount = await MongodbIndexService.updateIndexes({
      url: new oneOf(urls),
      uploaded: true,
    }, {
      expiresAt: confirm ? null : moment().add(config.TTL, 'minutes').toISOString()
    });

    if (filesCount !== urls.length) {
      throw new createHttpError.BadRequest(
        'Some urls are invalid, have not been uploaded, or are repeated'
      )
    }

    return generateSuccessResponse()
  } catch (error) {
    console.error(error);

    return generateErrorResponse(error);
  }
};
