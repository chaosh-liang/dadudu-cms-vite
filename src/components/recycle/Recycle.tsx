import React, { FC, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Button, message, Popconfirm, Space, Table } from 'antd'
import styles from './Recycle.module.scss'
import { useRequest } from 'ahooks'
import { fetchDeletedGoods, recover } from '@/api/goods'
import type { GoodsT } from '@/@types/goods'
import { formatDate } from '@/utils'
import type { ColumnType } from 'rc-table/lib/interface'

const Recycle: FC<RouteComponentProps> = () => {
  const [gt, setGt] = useState(0) // 为了触发获取商品请求
  const [page_index, setPageIndex] = useState(1)
  const [page_size, setPageSize] = useState(10)

  // 获取所有商品
  const { data, loading: fetchDeletedGoodsLoading } = useRequest(
    fetchDeletedGoods.bind(null, { page_index, page_size }),
    {
      throwOnError: true,
      refreshDeps: [gt, page_index, page_size],
      formatResult({ data: { res, total, page_index, page_size } }) {
        // 格式化接口返回的数据
        // console.log('formatResult => ', res);
        const goods = res.map((item: GoodsT, index: number) => {
          const sequence = `0${(page_index - 1) * page_size + index + 1}`.slice(
            -2
          ) // 序号
          const { _id: key, create_time, update_time } = item
          return {
            ...item,
            key,
            sequence,
            create_time: create_time && formatDate(create_time),
            update_time: update_time && formatDate(update_time)
          }
        })
        return { goods, total, page_index, page_size }
      },
      onError(error) {
        console.log('Goods.tsx fetchDeletedGoods error => ', error)
      }
    }
  )

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
      key: 'sequence',
      align: 'center',
      width: 50
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 250
    },
    {
      title: '删除时间',
      dataIndex: 'update_time',
      key: 'update_time',
      align: 'center',
      width: 200
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      align: 'left'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      render: (text: string, record: Required<GoodsT>) => (
        <Space size={3}>
          <Popconfirm
            title="确定恢复吗?"
            okText="确认"
            cancelText="取消"
            onConfirm={() => handleRecover(record._id)}
          >
            <Button className={styles['operation-btn']} type="link">
              恢复
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 恢复操作
  const handleRecover = async (id: string) => {
    // console.log('handleRecover => ', id)
    const res = await recover({ _id: id, deleted: 0 })
    if (res?.error_code === '00') {
      message.success('已恢复')
      setGt(gt + 1)
    } else {
      message.error(res?.error_msg ?? '')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h4 className={styles.title}>回收站</h4>
      </header>
      <section className={styles.section}>
        <Table
          size="small"
          loading={fetchDeletedGoodsLoading}
          columns={columns}
          dataSource={data?.goods ?? []}
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

export default Recycle
