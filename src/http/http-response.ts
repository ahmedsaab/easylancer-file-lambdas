export interface ILambdaHttpResponse {
  readonly body: string;
  readonly headers: object;
  readonly statusCode: number;
}

export function generateResponse(statusCode, payload): ILambdaHttpResponse {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
}
