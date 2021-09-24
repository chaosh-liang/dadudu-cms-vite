import Service from '../http'
const service = new Service()

const UPLOAD_URL = '/api/upload'

export const upload = (data: FormData) => service.postData(UPLOAD_URL, data)
