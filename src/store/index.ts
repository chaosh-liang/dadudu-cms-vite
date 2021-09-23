import {
  createStore,
  combineReducers,
  Reducer,
  AnyAction,
  applyMiddleware,
} from 'redux';
import type { Store } from 'redux';
import reducer from './reducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const initReducer = combineReducers(reducer);
const composeEnhancers = composeWithDevTools({ name: '大嘟嘟' });
const store = createStore(
  initReducer,
  composeEnhancers(applyMiddleware(thunk))
);

// 保存已注入的 reducer
const asyncReducers: Record<string, Reducer<any, AnyAction>> = { ...reducer };
// console.log('store >>> ', store);

// 动态注入 reducer
export const injectReducer = (
  store: Store,
  { key, reducer }: { key: string; reducer: Reducer }
) => {
  if (Reflect.has(asyncReducers, key)) return;
  asyncReducers[key] = reducer;
  store.replaceReducer(combineReducers({ ...asyncReducers }));
  // console.log('injectReducer after: ', Reflect.ownKeys(store.asyncReducers));
};

export default store;
