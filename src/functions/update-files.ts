import * as moment from 'moment';
import Indexer from '../services/mongodb.index-service'
import { oneOf } from "../services/interfaces/index-service";
import { generateErrorResponse, generateSuccessResponse } from "../http/http-response-factory";
import * as createHttpError from "http-errors";
import config from "../config";

export default async (event) => {
  try {
    const { urls, confirm } = JSON.parse(event.body.toString());
    const expiresAt = confirm ? null
      : moment().add(config.TTL, 'minutes').toISOString();

    const filesCount = await Indexer.update({
      url: new oneOf(urls),
      uploaded: true,
    }, {
      expiresAt
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
