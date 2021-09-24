import React, { FC, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, RouteComponentProps, useRouteMatch } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import type { ColumnType } from 'rc-table/lib/interface'
import {
  Space,
  Button,
  Table,
  Popconfirm,
  message,
  Form,
  Modal,
  Input,
  InputNumber
} from 'antd'
import styles from './Category.module.scss'
import type { CategoryT } from '@/@types/category'
import {
  addCategory,
  deleteCategory,
  editCategory
} from '@/api/categoryAndSeries'
import { fetchCategoryThunk } from '@/store/redux_thunk'

const Category: FC<RouteComponentProps> = () => {
  const { path } = useRouteMatch()
  // 表格列定义
  const columns: ColumnType<Required<CategoryT>>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      align: 'center'
    },
    {
      title: '类别名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text: string, record: Record<string, any>) => (
        <Link title="跳转至系列" to={`${path}/${record._id}`}>
          {text}
        </Link>
      )
    },
    {
      title: '系列数量',
      dataIndex: 'series_count',
      key: 'series_count',
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
      render: (text: string, record: Required<CategoryT>) => (
        <Space size="small">
          <Button
            className={styles['operation-btn']}
            type="link"
            onClick={() => handleEditCategory(record)}
          >
            编辑
          </Button>
          {record.series_count <= 0 ? (
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

  const formData: CategoryT = {
    name: '',
    desc: '',
    no: 1,
    series_data: []
  }

  const [aecMode, setAECMode] = useState<number>(1)
  const [aecData, setAECData] = useState<CategoryT>(formData)
  const [curEditCategory, setCurEditCategory] = useState<CategoryT>(formData)
  const [aecVisible, setAECVisible] = useState<boolean>(false)
  const [form] = Form.useForm()
  const dispatch = useDispatch()

  useEffect(() => {
    // console.log('category useEffect');
    if (aecVisible) {
      const { name, no, desc } = aecData
      form.setFieldsValue({ name, no, desc })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aecVisible])

  // 从 store 中获取类别数据
  const categoryData = useSelector((state: any) => {
    const {
      home: { category }
    } = state
    const copy = cloneDeep(category)
    copy.forEach((item: CategoryT) => {
      if (Reflect.has(item, 'children'))
        Reflect.deleteProperty(item, 'children')
    })
    return copy
  })

  // 添加 => 弹框
  const handleAddCategory = () => {
    // console.log('handleAddCategory');
    setAECMode(1)
    setAECData(formData)
    setAECVisible(true)
  }

  // 编辑 => 弹框
  const handleEditCategory = (record: Required<CategoryT>) => {
    // console.log('handleEditCategory => ', record);
    setAECMode(2)
    setAECData(record)
    setAECVisible(true)
    setCurEditCategory(record)
  }

  // 保存
  const handleSave = () => {
    form
      .validateFields()
      .then(async (values: CategoryT) => {
        // console.log('form.validateFields success => ', values);
        if (aecMode === 1) {
          // 添加模式
          const params_add: CategoryT = values
          // console.log('params_add => ', params_add);
          const res = await addCategory(params_add)
          if (res?.error_code === '00') {
            message.success('添加成功')
            setAECVisible(false)
            // redux-thunk 获取一次类别数据
            dispatch(fetchCategoryThunk())
          } else {
            message.error(res?.error_msg ?? '')
          }
        } else if (aecMode === 2) {
          // 编辑模式，只需要传改动的字段 和 _id
          const params_edit: Partial<CategoryT> = {}
          params_edit._id = curEditCategory._id
          // console.log('params_edit => ', params_edit);
          const keys2Params = (Reflect.ownKeys(values) as string[]).filter(
            (key) => !isEqual(values[key], curEditCategory[key])
          )
          if (keys2Params.length <= 0) {
            message.warning('没改动，无需保存')
            return
          }
          keys2Params.forEach((key) => {
            params_edit[key] = values[key]
          })
          const res = await editCategory(params_edit)
          if (res?.error_code === '00') {
            message.success('编辑成功')
            setAECVisible(false)
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
    setAECData(formData)
    setAECVisible(false)
  }

  // 删除
  const handleDelete = async (id: React.Key) => {
    // console.log('handleDelete', id);
    try {
      const res = await deleteCategory({ id })
      if (res?.error_code === '00') {
        message.success('删除成功')
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
        <h4 className={styles.title}>类别</h4>
        <div>
          <Button type="primary" size="middle" onClick={handleAddCategory}>
            添加
          </Button>
        </div>
      </header>
      <section className={styles.section}>
        <Table
          size="middle"
          columns={columns}
          pagination={false}
          dataSource={categoryData}
        />
      </section>
      <Modal
        width={600}
        destroyOnClose
        getContainer={false} // 挂载在当前 div 节点下，而不是 document.body
        title={aecMode === 1 ? '添加类别' : '编辑类别'}
        okText={aecMode === 1 ? '提交' : '保存'}
        cancelText="取消"
        visible={aecVisible}
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
                    aecMode === 2 ||
                    categoryData.every((i: CategoryT) => i.no !== value)
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
          <Form.Item validateFirst label="描述" name="desc">
            <Input.TextArea rows={5} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Category
