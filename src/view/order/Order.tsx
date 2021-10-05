import React, { FC, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Button, Space, Table } from 'antd'
import styles from './Order.module.scss'
import { useRequest } from 'ahooks'
import { fetchOrder } from '@/api/order'
import type { GoodsT } from '@/@types/goods'
import { formatDate } from '@/utils'
import type { ColumnType } from 'rc-table/lib/interface'

const Order: FC<RouteComponentProps> = () => {
  const [gt, setGt] = useState(0) // 为了触发获取商品请求
  const [page_index, setPageIndex] = useState(1)
  const [page_size, setPageSize] = useState(10)

  // 获取所有商品
  const { data, loading: fetchOrderLoading } = useRequest(
    fetchOrder.bind(null, { page_index, page_size }),
    {
      throwOnError: true,
      refreshDeps: [gt, page_index, page_size],
      formatResult({ data: { res, total, page_index, page_size } }) {
        // 格式化接口返回的数据
        // console.log('formatResult => ', res)
        const order = res.map((item: GoodsT, index: number) => {
          const sequence = `0${(page_index - 1) * page_size + index + 1}`.slice(
            -2
          ) // 序号
          const { _id: key, status, create_time } = item
          return {
            ...item,
            key,
            sequence,
            status: status && statusMapping(status),
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
  const columns: ColumnType<Required<GoodsT>>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      align: 'center',
      width: 50
    },
    {
      title: '用户昵称',
      dataIndex: 'user_name',
      align: 'center',
      width: 200
    },
    {
      title: '订单ID',
      dataIndex: 'order_id',
      align: 'center',
      width: 200
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      align: 'center',
      width: 100
    },
    {
      title: '订单金额',
      dataIndex: 'actual_pay',
      align: 'center',
      width: 100,
      render: (text: string, record: Required<GoodsT>) => (
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
      render: (text: string, record: Required<GoodsT>) => (
        <Space size={3}>
          <Button
            className={styles['operation-btn']}
            type="link"
            onClick={() => editGoods(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ]

  // 编辑
  const editGoods = async (record: Required<GoodsT>) => {
    console.log('editGoods => ', record)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h4 className={styles.title}>订单</h4>
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
    </div>
  )
}

export default Order
