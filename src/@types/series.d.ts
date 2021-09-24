export interface SeriesT extends Record<string, any> {
  _id?: string
  name: string
  category_id: string
  no: number
  desc: string
  icon_url: string
  goods_count: number
  create_time?: string
  update_time?: string
}
