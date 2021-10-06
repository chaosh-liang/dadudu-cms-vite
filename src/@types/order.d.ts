export interface IOrder {
  user_id: string
  goods_id: string
  goods_name: string
  gcount: number
  status: number
  order_status?: string
  actual_pay: number
  currency_unit: string
  create_time: string
  order_id: string
  nick_name: string
}
