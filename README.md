# Modern Serverless Deevelopment

# Serverless Offline + TS + Micro AWS λ + Dynamoose
  
 - https://github.com/Albert-Gao/micro-aws-lambda#intro

 - https://dynamoosejs.com/getting_started/Introduction

 - https://github.com/dherault/serverless-offline#serverless-offline

## Tooling / Dependencies

 - https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials

 - https://httpie.org

```
brew install awscli awscurl awslogs httpie serverless
```

## All started with:

```
sls create --template aws-nodejs-typescript
```

## Feel free to clone me

```
git clone https://github.com/josoroma/sls-challenge-ts.git

cd sls-challenge-ts
```

```
npm install
```

```
sls dynamodb install
```

## 1. Emulate AWS Services (SLS CLI)

Emulate AWS λ, API Gateway and DynamoDB on your local machine with:

```
sls offline start --stage dev
```

```
sls --help

sls offline --help
```

## 2. API Request (httpie)

```
http http://localhost:3000/dev/posts
```

Response:

```
HTTP/1.1 200 OK
Connection: keep-alive
Date: Fri, 11 Sep 2020 05:01:29 GMT
Transfer-Encoding: chunked
access-control-allow-credentials: true
access-control-allow-origin: *
cache-control: no-cache
content-encoding: gzip
content-type: application/json; charset=utf-8
vary: accept-encoding

{
    "debug": {
        "apiGatewayId": "ckexrwlra00011813ejci0xad",
        "country": "",
        "endpoint": "offlineContext_domainName",
        "lambdaRequestId": "ckexrwlrb000218132sof9aaf",
        "logGroupName": "offline_logGroupName_for_sls-challenge-ts-dev-JobGet",
        "logStreamName": "offline_logStreamName_for_sls-challenge-ts-dev-JobGet",
        "requestBody": "",
        "requestMethod": "GET"
    },
    "responseCreatedAtIndex": [
        {
            "createdAt": "1599718357157",
            "jobId": "02",
            "title": "Job 02",
            "userId": "02"
        },
        {
            "createdAt": "1599718357157",
            "jobId": "04",
            "title": "Job 04",
            "userId": "02"
        }
    ],
    "responseJobIndex": {
        "body": "<strong>Job Description 01</strong>",
        "createdAt": "1599718357157",
        "jobId": "01",
        "title": "Job 01",
        "updatedAt": "1599718357157",
        "userId": "01"
    },
    "responseTitleIndex": [
        {
            "body": "<strong>Job Description 01</strong>",
            "createdAt": "1599718357157",
            "jobId": "01",
            "title": "Job 01",
            "updatedAt": "1599718357157",
            "userId": "01"
        },
        {
            "body": "<strong>Job Description 03</strong>",
            "createdAt": "1599718357157",
            "jobId": "03",
            "title": "Job 03",
            "updatedAt": "1599718357157",
            "userId": "01"
        },
        {
            "body": "<strong>Job Description 05</strong>",
            "createdAt": "1599718357157",
            "jobId": "05",
            "title": "Job 05",
            "updatedAt": "1599718357157",
            "userId": "01"
        }
    ],
    "responseUpdatedAtIndex": [
        {
            "jobId": "04",
            "title": "Job 04",
            "updatedAt": "1599718357157",
            "userId": "02"
        },
        {
            "jobId": "02",
            "title": "Job 02",
            "updatedAt": "1599718357157",
            "userId": "02"
        }
    ]
}
```

## λ Function

### code jobs/get.ts

```
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
```

## Models

### models/job.ts

```
import * as dynamoose from "dynamoose";

const schemaJobRangeKey = new dynamoose.Schema({
  userId: String,
  jobId: { type: String, rangeKey: true },
  title: String,
  body: String,
  createdAt: String,
  updatedAt: String,
});

const schemaTitleRangeKey = new dynamoose.Schema({
  userId: String,
  jobId: String,
  title: { type: String, rangeKey: true },
  body: String,
  createdAt: String,
  updatedAt: String,
});

export const JobModel = dynamoose.model("Job", schemaJobRangeKey);

export const JobModelTitleIndex = dynamoose.model("Job", schemaTitleRangeKey);
```

## Composable Custom Middlewares

### code libs/middlewares/removeFieldsFromResponse.ts

```
import { Middleware } from "micro-aws-lambda";

export const removeFieldsFromResponse = (
  fieldsToRemove: string[]
): Middleware => ({ response }) => {
  const newResponse = Object.assign({}, response);

  fieldsToRemove.forEach((field) => {
    if (newResponse[field] != null) {
      delete newResponse[field];
    }
  });

  return newResponse;
};
```

## DynamoDB Table

### code serverless.ts

```
Resources: {
    CoursesTable: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
        TableName: "Job",
        AttributeDefinitions: [
        {
            AttributeName: "jobId",
            AttributeType: "S",
        },
        {
            AttributeName: "userId",
            AttributeType: "S",
        },
        {
            AttributeName: "title",
            AttributeType: "S",
        },
        {
            AttributeName: "createdAt",
            AttributeType: "S",
        },
        {
            AttributeName: "updatedAt",
            AttributeType: "S",
        },
        ],
        KeySchema: [
        {
            AttributeName: "userId",
            KeyType: "HASH",
        },
        {
            AttributeName: "jobId",
            KeyType: "RANGE",
        },
        ],
        GlobalSecondaryIndexes: [
        {
            IndexName: "TitleIndex",
            KeySchema: [
            {
                AttributeName: "userId",
                KeyType: "HASH",
            },
            {
                AttributeName: "title",
                KeyType: "RANGE",
            },
            ],
            Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["createdAt", "updatedAt"],
            },
        },
        ],
        LocalSecondaryIndexes: [
        {
            IndexName: "CreatedAtIndex",
            KeySchema: [
            {
                AttributeName: "userId",
                KeyType: "HASH",
            },
            {
                AttributeName: "createdAt",
                KeyType: "RANGE",
            },
            ],
            Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["title"],
            },
        },
        {
            IndexName: "UpdatedAtIndex",
            KeySchema: [
            {
                AttributeName: "userId",
                KeyType: "HASH",
            },
            {
                AttributeName: "updatedAt",
                KeyType: "RANGE",
            },
            ],
            Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["title"],
            },
        },
        ],
        BillingMode: "PAY_PER_REQUEST",
    },
    },
}
  ```

## Offline Data

### code offline/dynamodb/jobs.json

```
[
  {
    "jobId": "01",
    "userId": "01",
    "createdAt": "1599718357157",
    "updatedAt": "1599718357157",
    "title": "Job 01",
    "body": "<strong>Job Description 01</strong>"
  },
  {
    "jobId": "02",
    "userId": "02",
    "createdAt": "1599718357157",
    "updatedAt": "1599718357157",
    "title": "Job 02",
    "body": "<strong>Job Description 02</strong>"
  },
  {
    "jobId": "03",
    "userId": "01",
    "createdAt": "1599718357157",
    "updatedAt": "1599718357157",
    "title": "Job 03",
    "body": "<strong>Job Description 03</strong>"
  },
  {
    "jobId": "04",
    "userId": "02",
    "createdAt": "1599718357157",
    "updatedAt": "1599718357157",
    "title": "Job 04",
    "body": "<strong>Job Description 04</strong>"
  },
  {
    "jobId": "05",
    "userId": "01",
    "createdAt": "1599718357157",
    "updatedAt": "1599718357157",
    "title": "Job 05",
    "body": "<strong>Job Description 05</strong>"
  }
]
```

## Previous approach:

- https://github.com/josoroma/sls-challenge

# Happy Hacking!!!