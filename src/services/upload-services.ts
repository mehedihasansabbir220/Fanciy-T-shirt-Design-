import axios from "axios";
import { UploadUrlResponse } from "src/pages/api/upload-url";

export async function getUploadUrl(
  filename: string,
  contentType: string,
  folder?: string
) {
  const folderParamString = folder ? `&folder=${folder}` : "";
  const res = await axios.get(
    `/api/upload-url?filename=${filename}${folderParamString}&contentType=${contentType}`
  );
  console.log("getUploadUrl response:", res);
  return res.data as UploadUrlResponse;
}

export async function uploadData(
  { url, fields }: UploadUrlResponse,
  data: any
) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const json = JSON.stringify(data);
  const blob = new Blob([json], {
    type: "application/json",
  });
  formData.append("file", blob);
  formData.append("Content-Type", "application/json");

  const res = await axios.post(url, formData);
  console.log("uploadData response:", res);
}

export async function uploadImageDataUrl(
  { url, fields }: UploadUrlResponse,
  dataUrl: string
) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const { blob, mimeString } = dataURItoBlob(dataUrl);
  formData.append("file", blob);
  formData.append("Content-Type", mimeString);

  const res = await axios.post(url, formData);
  console.log("uploadImageDataUrl response:", res);
}

function dataURItoBlob(dataUrl: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataUrl.split(",")[1]);

  // separate out the mime component
  var mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return { blob, mimeString };
}
