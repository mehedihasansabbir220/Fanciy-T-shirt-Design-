import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"; // ES6 import

const ddbClient = new DynamoDB({
  credentials: {
    accessKeyId: process.env.NEST_FE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEST_FE_AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.NEST_FE_AWS_REGION || "us-east-1",
});

const ddbDocClient = DynamoDBDocument.from(ddbClient);

export { ddbClient, ddbDocClient };
