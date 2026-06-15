/** 全局类型声明（此文件不含 import，确保类型全局可用） */

declare type Recordable<T = any> = Record<string, T>;
declare type Nullable<T> = T | null;
declare type Fn = (...args: any[]) => any;
declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
