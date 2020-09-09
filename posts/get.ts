/**
 * On top of: https://github.com/Albert-Gao/micro-aws-lambda
 */

import { lambdas } from "micro-aws-lambda";

import { removeFieldsFromResponse } from "../libs/middlewares";

export const main = lambdas(
  [
    () => ({
      data: "Happy Hacking!!!",
      password: "P4ZsW0rD",
    }),
    removeFieldsFromResponse(["password"]),
  ],
  {
    addTraceInfoToResponse: true,
    logRequestInfo: true,
  }
);
