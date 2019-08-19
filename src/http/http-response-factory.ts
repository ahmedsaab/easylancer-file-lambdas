import { HttpError } from 'http-errors';
import { generateResponse, ILambdaHttpResponse } from "./http-response";

export function generateSuccessResponse(payload?: object): ILambdaHttpResponse {
  return generateResponse(200, payload)
}

export function generateErrorResponse(error): ILambdaHttpResponse {
  if(error instanceof HttpError) {
    return generateResponse(error.statusCode, {
      message: error.message
    })
  }
  return generateResponse(500, {
    message: 'unexpected error occurred'
  })
}

