import React, { FC, useEffect, useState } from 'react'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import { Form, Input, Button, message } from 'antd'
import { login, fetchBingImg } from '@/api/author'
import Styles from './Login.module.scss'

interface UserInfo {
  user_name: string
  password: string
}

const Login: FC<RouteComponentProps> = () => {
  const history = useHistory()
  const [logining, setLogining] = useState(false)
  const [bg, setBg] = useState('')

  useEffect(() => {
    if (!bg) fetchBingImage()
  }, [bg])

  // 获取必应每日一图，作为背景图
  const fetchBingImage = async () => {
    try {
      const result = (await fetchBingImg()) as any
      // console.log('/bing result => ', result)
      if (result?.data?.res?.data?.images?.[0]?.url) {
        const {
          data: {
            res: {
              data: {
                images: {
                  0: { url }
                }
              }
            }
          }
        } = result
        // 需拼接前缀域名 https://www.cn.bing.com/ 或 https://www.bing.com/ 或 http://s.cn.bing.net/
        const completedUrl = `https://www.cn.bing.com/${url}`
        setBg(completedUrl)
      }
    } catch (error) {
      console.log('fetchBingImg error => ', error)
    }
  }

  // 加密（HmacSHA256）
  const encryption = (val: string) => {
    const Ciphertext = CryptoJS.HmacSHA256(val, 'YJDP_CMS')
    const base64 = CryptoJS.enc.Base64.stringify(Ciphertext)
    return base64
  }
  // 提交表单且数据验证成功后回调事件
  const onFinish = async (values: UserInfo) => {
    setLogining(true)
    const { user_name, password } = values
    const params = { user_name, password: encryption(password) }
    // console.log('onFinish => ', values, params)
    const res = await login(params)
    setLogining(false)
    if (res?.error_code === '00') {
      // console.log('res ', res)
      const {
        data: {
          res: { user_name: account, role }
        }
      } = res
      // 设置帐号信息 session
      localStorage.setItem('acc', account)
      localStorage.setItem('fragile', role)
      history.replace('/app')
    } else {
      message.error(res?.error_msg)
    }
  }

  // 	提交表单且数据验证失败后回调事件
  const onFinishFailed = (errorInfo: any) => {
    console.log('onFinishFailed: ', errorInfo)
  }

  return (
    <div className={Styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={Styles['form-container']}>
        <Form
          name="basic"
          labelCol={{
            span: 5
          }}
          wrapperCol={{
            span: 19
          }}
          initialValues={{
            remember: true
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="帐号"
            name="user_name"
            rules={[
              {
                required: true,
                message: '帐号不能为空'
              }
            ]}
          >
            <Input placeholder="请输入帐号" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: true,
                message: '密码不能为空'
              }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 5,
              span: 19
            }}
          >
            <Button type="primary" htmlType="submit" loading={logining}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className={Styles.filing}>粤ICP备2021173027号-1</div>
    </div>
  )
}

export default Login
