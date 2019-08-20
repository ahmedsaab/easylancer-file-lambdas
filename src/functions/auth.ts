import * as jwkToPem from "jwk-to-pem";
import * as jwk from "jsonwebtoken";
import { AuthResponse, CustomAuthorizerEvent } from "aws-lambda";
import axios from 'axios';

import config from "../config";

const iss = config.ISSUER_URL;

interface DecodedJWT {
  sub: string;
  [key: string]: any;
}

const generatePolicy = (principalId, effect, resource): AuthResponse  => ({
  principalId: principalId,
  policyDocument: {
    Statement: [{
      Resource: resource,
      Effect: effect,
      Action: 'execute-api:Invoke'
    }],
    Version: '2012-10-17',
  }
});

export default async (event: CustomAuthorizerEvent) => {
  if (event.authorizationToken) {
    try {
      const token: string = event.authorizationToken.substring(7);
      const authServerJwk = await axios.get(`${iss}.well-known/jwks.json`).then(
        resp => resp.data
      );
      const pem: string = jwkToPem(authServerJwk.keys[0]);
      const decodedJwt = (await jwk.verify(token, pem, {
        issuer: iss
      })) as DecodedJWT;

      return generatePolicy(decodedJwt.sub, 'Allow', event.methodArn);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  throw(new Error(
    'No authorizationToken found in the header.'
  ));
};
