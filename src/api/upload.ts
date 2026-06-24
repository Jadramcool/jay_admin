import request from '@/utils/http/axios'

enum API {
  upload = '/upload',
}

export const UploadApi = {
  upload: (data: FormData) =>
    request.post<{ url: string }>({ url: API.upload, data }),
}
