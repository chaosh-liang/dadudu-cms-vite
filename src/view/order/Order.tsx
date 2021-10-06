import React, { FC, useEffect, useState } from 'react'
import { RouteComponentProps, useHistory, useLocation } from 'react-router-dom'
import { Button, Modal, Space, Table, Form, Select, Input, message } from 'antd'
import styles from './Order.module.scss'
import { useMount, useRequest } from 'ahooks'
import { fetchOrder, updateOrder } from '@/api/order'
import { formatDate, getQueryString } from '@/utils'
import type { ColumnType } from 'rc-table/lib/interface'
import type { IOrder } from '@/@types/order'

const Order: FC<RouteComponentProps> = () => {
  const [gt, setGt] = useState(0) // 为了触发获取商品请求
  const [page_index, setPageIndex] = useState(1)
  const [page_size, setPageSize] = useState(10)
  const [mVisible, setMVisible] = useState(false)
  const history = useHistory()
  const { search: searchParams, pathname } = useLocation()
  const [searchValue, setSearchValue] = useState('')

  // 表单实例，维护表单字段和状态
  const [form] = Form.useForm()
  const defaultFormData = {
    user_id: '',
    goods_id: '',
    goods_name: '',
    gcount: 1,
    status: 1,
    order_status: '待付款',
    actual_pay: 1,
    currency_unit: '',
    create_time: '',
    order_id: '',
    nick_name: ''
  }
  // 表单数据
  const [formData, setFormData] = useState<IOrder>(defaultFormData)

  useMount(() => {
    const { q } = getQueryString(searchParams)
    // console.log('Order.tsx 初始化查询条件 => ', q)
    setSearchValue(q)
  })

  useEffect(() => {
    // console.log('series useEffect');
    if (mVisible) {
      form.setFieldsValue({ ...formData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mVisible])

  // 获取所有商品
  const { data, loading: fetchOrderLoading } = useRequest(
    fetchOrder.bind(null, {
      page_index,
      page_size,
      q: getQueryString(searchParams).q
    }),
    {
      throwOnError: true,
      refreshDeps: [gt, page_index, page_size, searchParams],
      formatResult({ data: { res, total, page_index, page_size } }) {
        // 格式化接口返回的数据
        // console.log('formatResult => ', res)
        const order = res.map((item: IOrder, index: number) => {
          const sequence = `0${(page_index - 1) * page_size + index + 1}`.slice(
            -2
          ) // 序号
          const { order_id: key, status, create_time } = item
          return {
            ...item,
            key,
            sequence,
            order_status: status && statusMapping(status),
            create_time: create_time && formatDate(create_time)
          }
        })
        return { order, total, page_index, page_size }
      },
      onError(error) {
        console.log('Goods.tsx fetchDeletedGoods error => ', error)
      }
    }
  )

  // 订单状态转换
  const statusMapping = (i: number) => {
    const orderStatus = [, '待付款', '待发货', '已完成']
    return orderStatus[i]
  }

  const pageNumChange = (page_index: number) => {
    // console.log('pageNumChange ', page_index);
    setPageIndex(page_index)
  }
  const pageSizeChange = (page_index: number, page_size: number) => {
    // console.log('pageSizeChange ', page_index, page_size);
    setPageSize(page_size)
  }

  // 表格列定义
  const columns: ColumnType<Required<IOrder>>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      align: 'center',
      width: 50
    },
    {
      title: '用户昵称',
      dataIndex: 'nick_name',
      align: 'center',
      width: 200
    },
    {
      title: '订单编号',
      dataIndex: 'order_id',
      align: 'center',
      width: 200
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'center',
      width: 100
    },
    {
      title: '订单金额',
      dataIndex: 'actual_pay',
      align: 'center',
      width: 100,
      render: (text: string, record: Required<IOrder>) => (
        <div>
          <span>{record.currency_unit}</span>
          <span>{text}</span>
        </div>
      )
    },
    {
      title: '下单时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 150
    },
    {
      title: '下单商品',
      dataIndex: 'goods_name',
      align: 'center',
      width: 300
    },
    {
      title: '下单数量',
      dataIndex: 'gcount',
      align: 'center',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 150,
      render: (text: string, record: Required<IOrder>) => (
        <Space size={3}>
          <Button
            className={styles['operation-btn']}
            type="link"
            onClick={() => editOrder(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ]

  // 编辑
  const editOrder = async (record: Required<IOrder>) => {
    // console.log('editOrder => ', record)
    setFormData(record)
    setMVisible(true)
  }

  // 保存
  const handleSave = () => {
    // console.log('handleSave')
    form
      .validateFields()
      .then(async (values: Pick<IOrder, 'order_id' | 'status'>) => {
        // console.log('handleSave => ', values)
        const { order_id, status } = values // 此处只改动【订单状态】

        if (status === formData.status) {
          message.warning('没改动，无需保存')
          return
        }

        const res = await updateOrder({ order_id, status })
        if (res?.error_code === '00') {
          message.success('编辑成功')
          setMVisible(false)
          setGt(gt + 1) // 重新获取一次系列数据
        } else {
          message.error(res?.error_msg ?? '')
        }
      })
  }

  // 取消
  const handleCancel = () => {
    // console.log('handleCancel')
    setMVisible(false)
  }

  // 搜索事件
  const searchHandler = (value: string) => {
    // console.log('searchHandler => ', value)
    setSearchValue(value)
    history.push({
      pathname,
      search: `?q=${value.trim()}`
    })
  }

  // 搜索框改变时触发
  const searchChangeHandler = (ev: any) => {
    // console.log('searchChangeHandler => ', ev.target.value)
    setSearchValue(ev.target.value)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles['header-left']}>
          <Input.Search
            placeholder="昵称、描述"
            onSearch={searchHandler}
            onChange={searchChangeHandler}
            allowClear
            enterButton
            value={searchValue}
          />
        </div>
      </header>
      <section className={styles.section}>
        <Table
          size="small"
          loading={fetchOrderLoading}
          columns={columns}
          dataSource={data?.order ?? []}
          pagination={{
            showSizeChanger: true, // 是否可以改变 pageSize boolean
            // total: 803, // 调试使用
            total: data?.total ?? 0, // 数据总数 number
            current: data?.page_index ?? 1, // 当前页数 number
            onChange: pageNumChange, // 页码改变的回调，参数是改变后的页码及每页条数 Function(page, pageSize)
            pageSizeOptions: ['10', '15', '20', '50'], // 指定每页可以显示多少条 string[]
            onShowSizeChange: pageSizeChange, // pageSize 变化的回调 Function(current, size)
            // showTotal: total => (`共 ${total} 条数据`), // 调试使用
            showTotal: (total) => `共 ${data?.total ?? 0} 条数据` // 用于显示数据总量和当前数据顺序 Function(total, range)
          }}
        />
      </section>
      <Modal
        width={600}
        destroyOnClose
        getContainer={false} // 挂载在当前 div 节点下，而不是 document.body
        title="编辑订单"
        okText="保存"
        cancelText="取消"
        visible={mVisible}
        onOk={handleSave}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          colon={false}
          size="middle"
          autoComplete="off"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item label="订单编号" name="order_id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="用户昵称" name="nick_name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="商品名称" name="goods_name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="订单状态" name="status">
            <Select>
              <Select.Option value={1} key={1}>
                待付款
              </Select.Option>
              <Select.Option value={2} key={2}>
                待发货
              </Select.Option>
              <Select.Option value={3} key={3}>
                已完成
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Order
