import * as AWS from "aws-sdk";
import { lambdas } from "micro-aws-lambda";
import { DataMapper } from "@aws/dynamodb-data-mapper";
import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from "@aws/dynamodb-data-mapper-annotations";

import { removeFieldsFromResponse } from "../libs/middlewares";

AWS.config.update({
  region: "localhost",
  accessKeyId: "xxxx",
  secretAccessKey: "xxxx",
});

const mapper = new DataMapper({
  client: new AWS.DynamoDB({
    endpoint: "http://localhost:8000",
  }),
});

@table("Task")
class Task {
  @hashKey()
  id: string;

  @rangeKey({ defaultProvider: () => Date.now() })
  createdAt: string;

  @attribute()
  title: string;

  @attribute()
  body: string;
}

export const main = lambdas(
  [
    async () => {
      let result = [];

      // const result = mapper.get(
      //   Object.assign(new Task(), { id: "01", createdAt: "1599718357157" })
      // );

      for await (const task of mapper.scan(Task)) {
        result.push(task);
      }

      return result;
    },
    removeFieldsFromResponse(["password"]),
  ],
  {
    addTraceInfoToResponse: true,
    logRequestInfo: true,
  }
);
