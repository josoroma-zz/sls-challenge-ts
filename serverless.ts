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
              table: "post",
              sources: ["./migrations/posts.json"],
            },
          ],
        },
      },
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
  },
  functions: {
    postsGet: {
      handler: "posts/get.main",
      events: [
        {
          http: {
            method: "get",
            path: "posts",
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
