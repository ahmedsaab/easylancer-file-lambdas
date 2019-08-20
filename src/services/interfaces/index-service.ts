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
  create(userId: UserId, expiresAt: string): Promise<string>;
  query(selector: object): Promise<Array<object>>;
  updateById(id: IndexId, updates: Partial<Index>);
  update(selector: object, updates: Partial<Index>): Promise<number>;
  delete(selector: object): Promise<number>;
}
