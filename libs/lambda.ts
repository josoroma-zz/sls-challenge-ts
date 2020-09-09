import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
} from "aws-lambda";

import "source-map-support/register";

import PlainObject from "../types/PlainObject";

import { success } from "./response";

const lambda = (
  handler: (
    event: APIGatewayProxyEvent,
    context: Context
  ) => Promise<PlainObject> | PlainObject
) => async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => {
  try {
    const result = await handler(event, context);

    console.log(context);

    callback(null, success(result));
  } catch (err) {
    callback(null, err);
  }
};

export default lambda;
