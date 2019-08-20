import  {IStorageService, IPostSignedUpload, IDeleteFilesResponse } from "./interfaces/storage-service";
import { PresignedPost } from "aws-sdk/lib/s3/presigned_post";
import config from "../config";
import * as AWS from "aws-sdk";
import { DeleteObjectsOutput } from "aws-sdk/clients/s3";

const S3 = new AWS.S3({ signatureVersion: 'v4' });

const params = {
  Bucket: config.AWS_BUCKET,
};

class S3StorageService implements IStorageService {
  async requestSignedPost(filePath: string): Promise<IPostSignedUpload> {
    const upload: PresignedPost = await S3.createPresignedPost(
      Object.assign(params, {
        Fields: {
          key: filePath
        },
        Conditions: [
          ["content-length-range", 10000, 10485760],
          // ['starts-with', '$Content-Type', "image/"],
        ],
        Expires: 30,
      })
    );
    const urlSeg = upload.url.split('//')[1].split('/');
    const download =  { url: `https://${urlSeg[1]}.${urlSeg[0]}/${filePath}`};

    return { upload, download}
  };

  async delete(keys: Array<string>): Promise<IDeleteFilesResponse> {
    if (keys.length) {
      return S3.deleteObjects(Object.assign(params, {
        Delete: {
          Objects: keys.map(key => (
            {
              Key: key
            }
          ))
        }
      })).promise().then((response: DeleteObjectsOutput) => ({
        deleted: response.Deleted.map(object => object.Key),
        errored: response.Errors.map(error => error.Key),
      }))
    }
    return {
      deleted: [],
      errored: []
    };
  }
}

export default new S3StorageService();
