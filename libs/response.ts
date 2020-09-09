import PlainObject from "../types/PlainObject";

const success = (body: PlainObject) => buildResponse(200, body);

const badRequest = (body: PlainObject) => buildResponse(400, body);

const internalError = (body: PlainObject) => buildResponse(500, body);

const buildResponse = (statusCode: number, body: PlainObject) => ({
  body: JSON.stringify(body),
  headers: {
    "Access-Control-Allow-Origin": process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
    "Access-Control-Allow-Credentials": true,
    "Content-Type": "application/json",
  },
  statusCode: statusCode,
});

export { success, badRequest, internalError, buildResponse };
