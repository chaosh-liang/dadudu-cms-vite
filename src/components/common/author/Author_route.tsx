import React, { FC, useState } from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { Typography, Spin, message } from 'antd'
import { useRequest } from 'ahooks'
import { loggedCheck } from '@/api/author'

const { Text } = Typography
const tipBox = (el: JSX.Element) => (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      paddingTop: '40px',
      boxSizing: 'border-box',
      backgroundColor: '#f0f2f5'
    }}
  >
    {el}
  </div>
)

const AuthorRoute: FC<RouteProps> = (props) => {
  const { component, ...rest } = props
  const [back2Login, setBck2Login] = useState(false)
  const [exception, setExpection] = useState(false)
  const [appLogined, setAppLogined] = useState(false)
  const [exceptionInfo, setExceptionInfo] = useState<string>('')

  useRequest(loggedCheck, {
    onSuccess(result) {
      // console.log('loggedCheck success => ', result);
      const { data, error_code, error_msg } = result
      if (error_code === '00') {
        if (data?.res?.online) {
          setAppLogined(true)
        } else {
          message.error('请重新登录', () => setBck2Login(true))
        }
      } else {
        setExpection(true)
        setExceptionInfo(
          typeof error_msg === 'string' ? error_msg : error_msg.message
        )
      }
    },
    onError(error) {
      setExpection(true)
      setExceptionInfo(error.message)
    }
  })

  return (
    <>
      {back2Login && <Redirect to="/login" />}
      <Route
        {...rest}
        render={(props) => {
          if (exception)
            return tipBox(<Text type="danger">{exceptionInfo}</Text>)
          if (appLogined) return <Route component={component} {...props} />
          return tipBox(<Spin size="large" />)
        }}
      />
    </>
  )
}

export default AuthorRoute
