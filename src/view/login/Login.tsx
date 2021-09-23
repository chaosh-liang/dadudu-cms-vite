import React, { FC, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Form, Input, Button, message } from 'antd';
import { login } from '@/api/author';
import Styles from './Login.module.scss';

interface UserInfo {
  user_name: string;
  password: string;
}

const Login: FC<RouteComponentProps> = () => {
  const history = useHistory();
  const [logining, setLogining] = useState(false)

  // 加密（HmacSHA256）
  const encryption = (val: string) => {
    const Ciphertext = CryptoJS.HmacSHA256(val, 'DADUDU_CMS');
    const base64 = CryptoJS.enc.Base64.stringify(Ciphertext);
    return base64;
  }
  // 提交表单且数据验证成功后回调事件
  const onFinish = async (values: UserInfo) => {
    setLogining(true);
    const { user_name, password } = values;
    const params = { user_name, password: encryption(password) }
    // console.log('onFinish => ', values, params);
    const res = await login(params);
    setLogining(false)
    if (res?.error_code === '00') {
      history.replace("/app");
    } else {
      message.error(res?.error_msg);
    }
  };

  // 	提交表单且数据验证失败后回调事件
  const onFinishFailed = (errorInfo: any) => {
    console.log('onFinishFailed: ', errorInfo);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles['form-container']}>
        <Form
          name='basic'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 19,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete='off'
        >
          <Form.Item
            label='帐号'
            name='user_name'
            rules={[
              {
                required: true,
                message: '帐号不能为空',
              },
            ]}
          >
            <Input placeholder='请输入帐号' />
          </Form.Item>

          <Form.Item
            label='密码'
            name='password'
            rules={[
              {
                required: true,
                message: '密码不能为空',
              },
            ]}
          >
            <Input.Password placeholder='请输入密码' />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 5,
              span: 19,
            }}
          >
            <Button type='primary' htmlType='submit' loading={logining}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
