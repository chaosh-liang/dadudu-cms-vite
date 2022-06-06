export interface GoodsT extends Record<string, any> {
  _id?: string
  name_zh: string
  name_en: string
  desc_zh: string
  desc_en: string
  icon_url: string
  price: number
  series_id: string
  category_id: string
  series_name?: string
  category_name?: string
  home_banner: boolean
  home_display: boolean
  desc_url: string[]
  banner_url: string[]
  create_time?: string
  update_time?: string
}
