import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import App from '@/view/app/App'
import Login from '@/view/login/Login'
import AuthorRoute from '@/components/common/author/Author_route'
import store from '@/store'

import './index.css'
if (process.env.NODE_ENV === 'development') await import('antd/dist/antd.css') // 生产环境使用 cdn
import '@/assets/scss/common.scss'
import '@/assets/scss/antd.override.scss'

const RenderJsx = () => (
  <Provider store={store}>
    <HashRouter>
      <Suspense
        fallback={
          <div
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'start',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(0, 0, 0, .65)',
              paddingTop: '40px',
              boxSizing: 'border-box',
              backgroundColor: '#f0f2f5'
            }}
          >
            应用加载异常，请检查网络或联系管理员
          </div>
        }
      >
        <Switch>
          {/* 没有 exact 表示，此路由不管是否有子路由或参数，都渲染这个组件 */}
          <Route path="/login" render={(props) => <Login {...props} />} />
          <AuthorRoute path="/app" component={App} />
          {/* 顶级路由不匹配时跳转至登录页 */}
          <Redirect to="/login" />
        </Switch>
      </Suspense>
    </HashRouter>
  </Provider>
)

// 挂载
ReactDOM.render(
  process.env.NODE_ENV === 'production' ? (
    // 严格模式报此警告："findDOMNode is deprecated in StrictMode" warning
    <React.StrictMode>
      <RenderJsx />
    </React.StrictMode>
  ) : (
    <RenderJsx />
  ),
  document.getElementById('root')
)
