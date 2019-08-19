export class oneOf {
  public values: any;

  constructor(values) {
    this.values = values;
  }
}

export class isDefined {
  public value: any;

  constructor(value) {
    this.value = value;
  }
}

export class lessThan {
  public value: any;

  constructor(value) {
    this.value = value;
  }
}

export type IndexId = string;
export type UserId = string;
export type Selector = {
  [key: string]: string | number | boolean | isDefined | oneOf | lessThan
}

export interface Index {
  id: IndexId,
  userId: UserId,
  url: string,
  key: string,
  fileSize: number,
  expiresAt: string,
  uploaded: boolean,
}

export default interface IIndexService {
  createIndex(userId: UserId, expiresAt: string): Promise<string>;
  queryIndex(selector: object): Promise<Array<object>>;
  updateIndex(id: IndexId, updates: Partial<Index>);
  updateIndexes(selector: object, updates: Partial<Index>): Promise<number>;
  deleteIndexes(selector: object): Promise<number>;
}
