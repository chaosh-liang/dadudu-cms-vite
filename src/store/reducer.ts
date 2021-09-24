import { ActionType } from './action_type'
import type { AnyAction, Reducer } from 'redux'

const initState = {
  // 初始 state
  field1: '示例字段1',
  field2: '示例字段2',
  mainvh: 768
}

// action 类型固定了，必须是 AnyAction
// 与 { payload: Record<string, any>, [key: string]: any } 不兼容
// 所以 action 中只有字段 type(string) 是必须的
const initialReducer: Reducer<typeof initState, AnyAction> = (
  state = initState,
  action
) => {
  const { type, payload = {} } = action
  switch (type) {
    case ActionType.INIT_EXAMPLE_DATA: {
      const { example } = payload
      return { ...state, field1: example }
    }
    case ActionType.SET_MAIN_VH: {
      const { h } = payload
      return { ...state, mainvh: h }
    }
    default:
      return state
  }
}

const initReducer = {
  init: initialReducer
}

export default initReducer
