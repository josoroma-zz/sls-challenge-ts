import * as dynamoose from "dynamoose";

const schemaJobRangeKey = new dynamoose.Schema({
  userId: { type: String, hashKey: true },
  jobId: { type: String, rangeKey: true },
  title: {
    type: String,
    index: {
      global: true,
      name: "TitleIndex",
      rangeKey: "title",
    },
  },
  body: String,
  createdAt: {
    type: String,
    index: {
      name: "CreatedAtTitleIndex",
      rangeKey: "createdAt",
    },
  },
  updatedAt: {
    type: String,
    index: {
      name: "UpdatedAtIndex",
      rangeKey: "updatedAt",
    },
  },
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
