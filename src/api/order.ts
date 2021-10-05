import Service from '../http'
const service = new Service()

const ORDER_URL = '/api/order'

export const fetchOrder = (data: { page_index: number; page_size: number }) =>
  service.postData(ORDER_URL, data)
