import React, { FC, useEffect, useRef, useState } from 'react'
import {
  RouteComponentProps,
  Link,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
  Redirect
} from 'react-router-dom'
import { Button, Layout, Menu, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import styles from './App.module.scss'
import { logout } from '@/api/author'
import { useMount } from 'ahooks'
import { useDispatch } from 'react-redux'
import { ActionType } from '@/store/action_type'
import Home from '@/view/home/Home'
import Order from '@/view/order/Order'
import Settings from '@/view/settings/Settings'
import NoMatch from '@/view/404/NoMatch'
const { Header, Content } = Layout

const App: FC<RouteComponentProps> = () => {
  const history = useHistory()
  const location = useLocation()
  const { path } = useRouteMatch()
  const t_pathname = location.pathname.match(/^\/[^/]+\/[^/]+/g)?.[0] ?? ''
  const [curRoute, setCurRoute] = useState(t_pathname) // 设置当前路由高亮
  const [mainvh, setMainvh] = useState(768)
  const containerEl = useRef(null)
  const dispatch = useDispatch()

  const menu = [
    { name: '商品管理', route: `${path}/home` }, // 主页 => 商品管理
    { name: '订单管理', route: `${path}/order` },
    { name: '设置中心', route: `${path}/settings` }
  ]

  useMount(() => {
    if (containerEl?.current) {
      const h =
        (containerEl.current as unknown as HTMLElement).offsetHeight - 64 // 64: 头部高度
      setMainvh(h)
      dispatch({ type: ActionType.SET_MAIN_VH, payload: { h } })
    }
  })

  useEffect(() => {
    const t_pathname = location.pathname.match(/^\/[^/]+\/[^/]+/g)?.[0] ?? ''
    setCurRoute(t_pathname)
  }, [location])

  // 注销登录
  const handleLogout = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要注销登录吗？',
      okText: '确定',
      cancelText: '取消',
      async onOk() {
        const res = await logout()
        if (res?.error_code === '00') {
          setTimeout(() => history.push('/login'), 500) // 反应太快，导致：已经切到 login 页面了，注销提示框还没消失
        }
      }
    })
  }

  return (
    <div className={styles.container} ref={containerEl}>
      <Layout>
        <Header className={styles.header}>
          <Menu theme="dark" mode="horizontal" selectedKeys={[curRoute]}>
            {menu.map((item) => {
              return (
                <Menu.Item key={item.route}>
                  <Link to={item.route}>{item.name}</Link>
                </Menu.Item>
              )
            })}
          </Menu>
          <Button type="link" onClick={handleLogout}>
            注销
          </Button>
        </Header>
        <Content className={styles.main} style={{ height: `${mainvh}px` }}>
          <Switch>
            <Route
              path={`${path}/home`}
              render={(props) => <Home {...props} />}
            />
            <Route
              path={`${path}/order`}
              render={(props) => <Order {...props} />}
            />
            <Route
              path={`${path}/settings`}
              render={(props) => <Settings {...props} />}
            />
            <Redirect exact path={path} to={`${path}/home`} />
            <Route path="**" render={(props) => <NoMatch {...props} />} />
          </Switch>
        </Content>
      </Layout>
    </div>
  )
}

export default App
