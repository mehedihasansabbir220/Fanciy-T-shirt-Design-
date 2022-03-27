import { NextApiRequest, NextApiResponse } from "next";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { generateNanoId } from "src/framework/utils";

export type UploadUrlResponse = {
  url: string;
  fields: {
    [key: string]: string;
  };
  folder: string;
  fullFilePath: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.NEST_FE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.NEST_FE_AWS_SECRET_ACCESS_KEY || "",
    },
    region: process.env.NEST_FE_AWS_REGION || "us-east-1",
  });

  if (!req.query.filename) {
    throw new Error("filename is required");
  }

  if (!req.query.contentType) {
    throw new Error("contentType is required");
  }

  let folder: string;
  if (!req.query.folder) {
    folder = await generateNanoId();
  } else {
    folder = req.query.folder as string;
  }

  const key = (folder + "/" + req.query.filename) as string;

  const Bucket = process.env.BUCKET_USER_DESIGNS || "user-designs";
  const Fields = {
    acl: "public-read",
    "Content-Type": req.query.contentType as string,
  };

  const post = await createPresignedPost(client, {
    Bucket,
    Key: key,
    Conditions: [
      { acl: "public-read" },
      { bucket: Bucket },
      ["starts-with", "$key", key],
      ["content-length-range", 0, 52428800], // up to 50 MB
    ],
    Fields,
    Expires: 600, //Seconds before the presigned post expires. 3600 by default.
  });

  console.log("createPresignedPost response:", post);

  res
    .status(200)
    .json({ ...post, folder: folder, fullFilePath: key } as UploadUrlResponse);
}
