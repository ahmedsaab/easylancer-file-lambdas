export interface IPostSignedUpload {
  upload: {
    url: string,
    fields: object,
  }
  download: {
    url: string,
  }
}

export interface IDeleteFilesResponse {
  deleted: Array<string>;
  errored: Array<string>;
}

export interface IStorageService {
  requestSignedPost(string): Promise<IPostSignedUpload>;
  deleteFiles(filePaths): Promise<IDeleteFilesResponse>;
}
