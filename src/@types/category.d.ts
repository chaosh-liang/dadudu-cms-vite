import type { SeriesT } from './series'
export interface CategoryT extends Record<string, any> {
  _id?: string
  name_zh: string
  name_en: string
  desc: string
  no: number
  series_data: SeriesT[]
  create_time?: string
  update_time?: string
}
