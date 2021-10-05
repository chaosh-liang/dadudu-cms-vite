import Service from '../http'
const service = new Service()
import type { IOrder } from '@/@types/order'

const ORDER_URL = '/api/order'
const UPDATE_ORDER_URL = '/api/order/update'

export const fetchOrder = (data: { page_index: number; page_size: number }) =>
  service.postData(ORDER_URL, data)
export const updateOrder = (data: Partial<IOrder>) =>
  service.putData(UPDATE_ORDER_URL, data)
