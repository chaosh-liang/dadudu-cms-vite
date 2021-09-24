/*
 * @Author: Broli
 * @Email: broli.up.up.up@gmail.com
 * @Date: 2021-09-08 22:58:45
 * @LastEditors: Broli
 * @LastEditTime: 2021-09-14 00:41:10
 * @Description: 以下两种情况的操作，应在此文件中完成：
 * @Description: redux 中使用的副作用（如：请求）
 * @Description: store 中的公共方法（如：设置全局状态）
 */
import { formatDate } from '@/utils'
import { ActionType } from '@/store/action_type'
import { fetchCategories } from '@/api/categoryAndSeries'
import type { Dispatch } from 'redux'
import type { CategoryT } from '@/@types/category'

// 获取类别
export const fetchCategoryThunk = () => {
  return (dispatch: Dispatch) => {
    return fetchCategories()
      .then((result) => {
        // console.log('fetchCategoryThunk => ', result);
        const {
          data: { res }
        } = result
        const refineData = res.map((item: CategoryT, index: number) => {
          const { _id: key, name, series_data, create_time, update_time } = item
          series_data.forEach((s) => {
            s.label = s.name
            s.value = s._id
          })
          return {
            ...item,
            key,
            sequence: `0${index + 1}`.slice(-2),
            series_count: series_data.length,
            label: name,
            value: key,
            children: series_data,
            create_time: create_time && formatDate(create_time),
            update_time: update_time && formatDate(update_time)
          }
        })
        dispatch({
          type: ActionType.SET_CATEGORY_DATA,
          payload: { data: refineData }
        })
        return refineData // 返回给发起 dispatch 的组件
      })
      .catch((error) => {
        console.log('readux_thunk.ts fetchCategories error => ', error)
      })
  }
}
