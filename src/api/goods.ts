import Service from '../http'
import type { GoodsT } from '@/@types/goods'
const service = new Service()

const GOODS_URL = '/api/goods'
const ALL_EXPIRED_GOODS = '/api/goods/expired'
const ADD_GOODS = '/api/goods/add'
const UPDATE_GOODS = '/api/goods/update'
const DELETE_GOODS = '/api/goods/delete'

export const fetchGoods = (data: {
  page_index: number
  page_size: number
  q?: string
}) => service.postData(GOODS_URL, data)

export const fetchDeletedGoods = (data: {
  page_index: number
  page_size: number
}) => service.postData(ALL_EXPIRED_GOODS, data)

// 从删除中恢复商品
export const recover = (data: { _id: string; deleted: number }) =>
  service.putData(UPDATE_GOODS, data)

export const addGoods = (data: GoodsT) => service.postData(ADD_GOODS, data)

export const editGoods = (data: Partial<GoodsT>) =>
  service.putData(UPDATE_GOODS, data)

export const deleteGoods = (data: { ids: string[] | React.Key[] }) =>
  service.delData(DELETE_GOODS, { data })
