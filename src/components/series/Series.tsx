/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, RouteComponentProps, useParams } from 'react-router-dom'
import {
  addSeries,
  deleteSeries,
  editSeries,
  fetchSeries
} from '@/api/categoryAndSeries'
import { useRequest } from 'ahooks'
import type { ColumnType } from 'rc-table/lib/interface'
import {
  Space,
  Button,
  Table,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  InputNumber,
  Select
} from 'antd'
import type { CategoryT } from '@/@types/category'
import type { SeriesT } from '@/@types/series'
import styles from './Series.module.scss'
import { formatDate } from '@/utils'
import isEqual from 'lodash/isEqual'
import { fetchCategoryThunk } from '@/store/redux_thunk'
import LocalUpload from '@/components/common/upload/Upload'

type SeriesTable = SeriesT & {
  key: string
  sequence: string
  create_time: string
  update_time: string
}

const Series: FC<RouteComponentProps<{ id: string }>> = () => {
  const { id: category_id } = useParams<{ id: string }>()
  const formData: SeriesT = {
    name: '',
    category_id,
    no: 1,
    desc: '',
    icon_url: '',
    goods_count: 0
  }

  const initSeriesData = [
    {
      _id: 'id',
      key: 'id',
      name: '',
      category_id,
      no: 1,
      desc: '',
      icon_url: '',
      goods_count: 0,
      sequence: '01',
      create_time: '2021-09-10 18:31:49',
      update_time: '2021-09-10 18:31:49'
    }
  ]

  const [gt, setGt] = useState<number>(1)
  const [aesMode, setAESMode] = useState<number>(1)
  const [aesData, setAESData] = useState<SeriesT>(formData)
  const [aesVisible, setAESVisible] = useState<boolean>(false)
  const [curEditSeries, setCurEditSeries] = useState<SeriesT>(formData)
  const [seriesData, setseriesData] = useState<SeriesTable[]>(initSeriesData)
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  // 表格列定义
  const columns: ColumnType<Required<SeriesTable>>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      align: 'center'
    },
    {
      title: '系列名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string, record: Required<SeriesT>) => (
        <Link title="跳转至商品" to={`/app/home/goods?_key=${record._id}`}>
          {text}
        </Link>
      )
    },
    {
      title: '商品数量',
      dataIndex: 'goods_count',
      key: 'goods_count',
      align: 'center'
    },
    {
      title: '排序',
      dataIndex: 'no',
      key: 'no',
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      align: 'center'
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      align: 'center'
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (text: string, record: Required<SeriesT>) => (
        <Space size="small">
          <Button
            className={styles['operation-btn']}
            type="link"
            onClick={() => handleEditSeries(record)}
          >
            编辑
          </Button>
          {record.goods_count <= 0 ? (
            <Popconfirm
              title="确定删除?"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button className={styles['operation-btn']} type="link">
                删除
              </Button>
            </Popconfirm>
          ) : (
            <Button disabled className={styles['operation-btn']} type="link">
              删除
            </Button>
          )}
        </Space>
      )
    }
  ]

  const categoryData = useSelector((state: any) => state.home.category)

  useEffect(() => {
    // console.log('series useEffect');
    if (aesVisible) {
      form.setFieldsValue({ ...aesData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aesVisible])

  // 获取某列别下的所有系列【需要重新获取，因 store 下的数据格式没有字段: goods_count】
  const {
    data: tableData,
    loading: layoutLoading
  }: { data: Required<SeriesTable>[]; loading: boolean } = useRequest(
    fetchSeries.bind(null, category_id),
    {
      refreshDeps: [gt],
      formatResult({ data: { res } }) {
        // 格式化接口返回的数据
        // console.log('formatResult => ', result);
        return res.map((item: SeriesT, index: string) => {
          const { _id: key, create_time, update_time } = item
          return {
            ...item,
            key,
            sequence: `0${index + 1}`.slice(-2),
            create_time: create_time && formatDate(create_time),
            update_time: update_time && formatDate(update_time)
          }
        })
      },
      onSuccess(data: SeriesTable[]) {
        setseriesData(data)
      }
    }
  )

  // 添加 => 弹框
  const handleAddSeries = () => {
    // console.log('handleAddSeries');
    setAESMode(1)
    setAESData(formData)
    setAESVisible(true)
  }

  // 编辑 => 弹框
  const handleEditSeries = (record: Required<SeriesT>) => {
    // console.log('handleEditSeries => ', record);
    setAESMode(2)
    setAESData(record)
    setAESVisible(true)
    setCurEditSeries(record)
  }

  // 缩略图，上传后的回调
  const uploadIconSuccess = (path: string) => {
    // console.log('uploadIconSuccess => ', path);
    setAESData({ ...aesData, icon_url: path })
    form.setFieldsValue({ icon_url: path })
  }

  // 保存
  const handleSave = () => {
    // console.log('handleSave');
    form
      .validateFields()
      .then(async (values: SeriesT) => {
        // console.log('form.validateFields success => ', values);
        if (aesMode === 1) {
          // 添加模式
          const params_add: SeriesT = values
          // console.log('params_add => ', params_add);
          const res = await addSeries(params_add)
          if (res?.error_code === '00') {
            message.success('添加成功')
            setAESVisible(false)
            setGt(gt + 1) // 重新获取一次系列数据
            // redux-thunk 获取一次类别数据
            dispatch(fetchCategoryThunk())
          } else {
            message.error(res?.error_msg ?? '')
          }
        } else if (aesMode === 2) {
          // 编辑模式，只需要传改动的字段 和 _id
          const params_edit: Partial<SeriesT> = {}
          params_edit._id = curEditSeries._id
          // console.log('params_edit => ', params_edit);
          const keys2Params = (Reflect.ownKeys(values) as string[]).filter(
            (key) => !isEqual(values[key], curEditSeries[key])
          )
          if (keys2Params.length <= 0) {
            message.warning('没改动，无需保存')
            return
          }
          keys2Params.forEach((key) => {
            params_edit[key] = values[key]
          })
          const res = await editSeries(params_edit)
          if (res?.error_code === '00') {
            message.success('编辑成功')
            setAESVisible(false)
            setGt(gt + 1) // 重新获取一次系列数据
            // redux-thunk 获取一次类别数据
            dispatch(fetchCategoryThunk())
          } else {
            message.error(res?.error_msg ?? '')
          }
        }
      })
      .catch((errorInfo: any) => {
        console.log('form.validateFields error => ', errorInfo)
      })
  }

  // 取消
  const handleCancel = () => {
    // console.log('handleCancel');
    setAESData(formData)
    setAESVisible(false)
  }

  // 删除
  const handleDelete = async (id: React.Key) => {
    // console.log('handleDelete', id);
    try {
      const res = await deleteSeries({ id })
      if (res?.error_code === '00') {
        message.success('删除成功')
        setGt(gt + 1)
        // redux-thunk 获取一次类别数据
        dispatch(fetchCategoryThunk())
      } else {
        message.error(res.error_msg ?? '')
      }
    } catch (error: any) {
      // 捕获网络故障的错误
      message.error(error)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h4 className={styles.title}>
          <span>所属类别：</span>
          <span style={{ color: '#1890ff' }}>
            {categoryData.find(
              (category: CategoryT) => category._id === category_id
            )?.name ?? '--'}
          </span>
        </h4>
        <div>
          <Button type="primary" size="middle" onClick={handleAddSeries}>
            添加
          </Button>
        </div>
      </header>
      <section className={styles.section}>
        <Table
          size="middle"
          columns={columns}
          pagination={false}
          dataSource={tableData}
          loading={layoutLoading}
        />
      </section>
      <Modal
        width={600}
        destroyOnClose
        getContainer={false} // 挂载在当前 div 节点下，而不是 document.body
        title={aesMode === 1 ? '添加系列' : '编辑系列'}
        okText={aesMode === 1 ? '提交' : '保存'}
        cancelText="取消"
        visible={aesVisible}
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
          initialValues={aesData}
        >
          <Form.Item
            validateFirst
            label="名称"
            name="name"
            rules={[
              { required: true, message: '请输入名称' },
              { type: 'string', whitespace: true, message: '不能只输入空格符' }
            ]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            validateFirst
            label="排序"
            name="no"
            rules={[
              { required: true, message: '请输入序号' },
              () => ({
                validator(_, value: number) {
                  if (
                    aesMode === 2 ||
                    seriesData.every((s: SeriesT) => s.no !== value)
                  ) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('已存在序号'))
                }
              })
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item validateFirst label="类别" name="category_id">
            <Select>
              {categoryData.map((c: CategoryT) => (
                <Select.Option value={c._id ?? ''} key={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            validateFirst
            label="图标"
            name="icon_url"
            rules={[{ required: true, message: '请上传一张缩略图' }]}
          >
            <LocalUpload
              filePath={aesData.icon_url}
              uploadSuccess={uploadIconSuccess}
            />
          </Form.Item>
          <Form.Item validateFirst label="描述" name="desc">
            <Input.TextArea rows={5} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Series
