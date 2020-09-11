import * as AWS from "aws-sdk";
import * as dynamoose from "dynamoose";
import { lambdas } from "micro-aws-lambda";

// Middlewares
import { removeFieldsFromResponse } from "../libs/middlewares";
// Models
import { JobModel, JobModelTitleIndex } from "../models/job";

// AWS Config
AWS.config.update({
  region: "localhost",
  accessKeyId: "H499Y",
  secretAccessKey: "H4CkiNg",
});

// For the sake of the offline demo: `serverless offline start --stage dev`
dynamoose.aws.ddb.local();

export const main = lambdas(
  [
    async () => {
      const responseJobIndex = await JobModel.get({
        userId: "01",
        jobId: "01",
      });

      const responseTitleIndex = await JobModelTitleIndex.query({
        title: { contains: "Job" },
        userId: "01",
      })
        .sort("ascending")
        .exec();

      const responseCreatedAtIndex = await JobModel.query({
        userId: "02",
      })
        .sort("descending")
        .using("CreatedAtIndex")
        .exec();

      const responseUpdatedAtIndex = await JobModel.query({
        userId: "02",
      })
        .sort("ascending")
        .using("UpdatedAtIndex")
        .exec();

      return {
        responseJobIndex,
        responseTitleIndex,
        responseCreatedAtIndex,
        responseUpdatedAtIndex,
      };
    },
    removeFieldsFromResponse(["password"]),
  ],
  {
    addTraceInfoToResponse: true,
    logRequestInfo: true,
  }
);
