export interface ResponseModel<T = any> {
  code?: number | string;
  data: T;
  message?: string;
  errMsg?: string | Record<string, any>;
  success?: boolean;
}
