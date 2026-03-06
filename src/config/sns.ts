import { SNSClient } from "@aws-sdk/client-sns";
import { config } from "./config";

export const snsClient = new SNSClient({
  region: config.awsRegion,
  credentials: {
    accessKeyId:config.awsAccessKey as string,
    secretAccessKey: config.awsSecretKey as string,
  },
});