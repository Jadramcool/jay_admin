import type {
  ArrayBufferRequestConfig,
  BlobRequestConfig,
  JsonRequestConfig,
  RequestConfig,
  UploadRequestConfig,
} from '@/utils/http/types'

const publicConfig: RequestConfig = {
  responseType: 'text',
  silentFail: true,
  skipAuth: true,
  skipDuplicate: true,
  timeout: 5000,
}

const jsonConfig: JsonRequestConfig<{ name: string }, { id: number }> = {
  data: { name: 'demo' },
  params: { id: 1 },
  responseType: 'json',
}

const uploadConfig: UploadRequestConfig = {
  data: new FormData(),
  url: '/upload',
}

const blobConfig: BlobRequestConfig = { url: '/export' }
const arrayBufferConfig: ArrayBufferRequestConfig = {
  responseType: 'arraybuffer',
  url: '/export',
}

// @ts-expect-error _retry 仅允许 HTTP 内部实现使用
publicConfig._retry = true

// @ts-expect-error _replayCount 仅允许 HTTP 内部实现使用
publicConfig._replayCount = 1

// @ts-expect-error JSON 请求不能声明二进制响应
jsonConfig.responseType = 'blob'

// @ts-expect-error 上传请求的数据必须是 FormData
uploadConfig.data = { file: 'invalid' }

void blobConfig
void arrayBufferConfig
