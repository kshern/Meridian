export enum CkType {
  add = 'add',
  cost = 'cost',
}
export enum CkListKey {
  ck1 = 'ck1',
}

type ICk = {
  cost: {
    tili: number;
    time: number;
  };
  add: {
    tili: number;
    exp: number;
  };
  comment: string;
};