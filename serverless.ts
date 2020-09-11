import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "sls-challenge-ts",
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "1",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    dynamodb: {
      stages: ["dev"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true,
      },
      seed: {
        dev: {
          sources: [
            {
              table: "Job",
              sources: ["./offline/dynamodb/jobs.json"],
            },
          ],
        },
      },
    },
    "serverless-offline": {
      useChildProcesses: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    "serverless-webpack",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["cognito-identity:*", "dynamodb:*", "s3:*", "states:*"],
        Resource: ["*"],
      },
    ],
  },
  functions: {
    JobGet: {
      handler: "jobs/get.main",
      events: [
        {
          http: {
            method: "get",
            path: "jobs",
          },
        },
      ],
    },
  },
  resources: {
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
    },
  },
};

module.exports = serverlessConfiguration;
