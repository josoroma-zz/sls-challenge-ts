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
