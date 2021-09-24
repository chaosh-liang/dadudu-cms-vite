import React, { FC, useEffect, useState } from 'react'
import {
  RouteComponentProps,
  Link,
  Route,
  Switch,
  Redirect,
  useLocation,
  useRouteMatch
} from 'react-router-dom'
import { Layout, Menu, Spin } from 'antd'
import { useMount } from 'ahooks'
import { PieChartOutlined, DesktopOutlined } from '@ant-design/icons'
import Goods from '@/components/goods/Goods'
import Category from '@/components/category/Category'
import Series from '@/components/series/Series'
import styles from './Home.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import store, { injectReducer } from '@/store'
import reducer from './reducer'
import { fetchCategoryThunk } from '@/store/redux_thunk'

const { Content } = Layout

// 动态注入 reducer
injectReducer(store, { key: 'home', reducer })

const Home: FC<RouteComponentProps> = () => {
  const dispatch = useDispatch()
  const { path } = useRouteMatch()
  const location = useLocation()
  const [layoutLoading, setLayoutLoading] = useState(true)
  const mainvh = useSelector((state: any) => state.init.mainvh)
  const t_pathname =
    location.pathname.match(/^\/[^/]+\/[^/]+\/[^/]+/g)?.[0] ?? ''
  const [curRoute, setCurRoute] = useState(t_pathname) // 设置当前路由高亮

  const menu = [
    {
      name: '商品列表',
      route: `${path}/goods`,
      icon: <PieChartOutlined />
    },
    {
      name: '商品类别',
      route: `${path}/category`,
      icon: <DesktopOutlined />
    }
  ]

  useMount(() => {
    // 获取所有类别
    ;(dispatch(fetchCategoryThunk()) as any).then((data: any) => {
      setLayoutLoading(false)
    })
  })

  useEffect(() => {
    const t_pathname =
      location.pathname.match(/^\/[^/]+\/[^/]+\/[^/]+/g)?.[0] ?? ''
    setCurRoute(t_pathname)
  }, [location])

  // 获取类别和系列
  return (
    <div className={styles.container} style={{ minHeight: `${mainvh}px` }}>
      <Menu mode="vertical" selectedKeys={[curRoute]}>
        {menu.map((item) => {
          return (
            <Menu.Item key={item.route} icon={item.icon}>
              <Link to={item.route}>{item.name}</Link>
            </Menu.Item>
          )
        })}
      </Menu>
      <Content>
        <Spin spinning={layoutLoading}>
          <Switch>
            <Route
              exact
              path={`${path}/goods`}
              render={(props) => <Goods {...props} />}
            />
            <Route
              exact
              path={`${path}/category`}
              render={(props) => <Category {...props} />}
            />
            <Route
              exact
              path={`${path}/category/:id`}
              render={(props) => <Series {...props} />}
            />
            <Redirect to={`${path}/goods`} />
          </Switch>
        </Spin>
      </Content>
    </div>
  )
}

export default Home
