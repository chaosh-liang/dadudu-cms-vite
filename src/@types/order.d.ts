export interface IOrder {
  user_id: string
  goods_id: string
  goods_desc_zh: string
  gcount: number
  status: number
  order_status?: string
  actual_pay: number
  create_time: string
  order_id: string
  nick_name: string
}
