/*
 * @Author: Broli
 * @Email: broli.up.up.up@gmail.com
 * @Date: 2021-09-03 10:41:33
 * @LastEditors: Broli
 * @LastEditTime: 2021-09-22 10:25:57
 * @Description1: 建议使用 form 实例来维护表单状态
 * @Description1: 但 setFieldsValue 不会触发 onFieldsChange 和 onValuesChange
 * @Description1: 所以，想实现表单的双向绑定，还需外部对象辅助，描述参见下文 @Note
 * @Description2: form 实例绑定了 HTMLElement 之后，才能使用其方法
 * @Description2: useEffect 中使用 form.setFieldsValue，放在 if (props.visible) {} 判断中，正合适
 */

import React, { FC, useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Button,
  Cascader,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio
} from 'antd'
import isEqual from 'lodash/isEqual'
import type { GoodsT } from '@/@types/goods'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { addGoods, editGoods } from '@/api/goods'
import LocalUpload from '@/components/common/upload/Upload'
import styles from './AEGModal.module.scss'

interface LocalProps {
  mode: number
  visible: boolean
  data: GoodsT | null
  hideAEModal: (...args: any[]) => any
}

interface LocalFormData {
  name: string
  price: number
  desc: string
  discount_price: number
  discount_threshold: number
  count_unit: string
  currency_unit: string
  home_banner: boolean
  home_display: boolean
  cs_cascader: string[]
  icon_url: string
  desc_url: string[]
  banner_url: string[]
}

const AEGModal: FC<LocalProps> = (props) => {
  // 表单初始化数据：添加模式
  const addModeFormData = useMemo<LocalFormData>(
    () => ({
      name: '',
      price: 1,
      desc: '',
      discount_price: 1,
      discount_threshold: 1,
      count_unit: '',
      currency_unit: '￥',
      home_banner: false,
      home_display: false,
      cs_cascader: ['', ''],
      icon_url: '',
      desc_url: [''],
      banner_url: ['']
    }),
    []
  )

  // 表单实例，维护表单字段和状态
  const [form] = Form.useForm()
  // 表单数据
  const [formData, setFormData] = useState<LocalFormData>(addModeFormData)

  // 表单初始化数据：编辑模式
  useEffect(() => {
    // console.log('AddEditModal useEffect');
    if (props.visible) {
      if (props.mode === 2 && props.data) {
        // console.log('mode === 2');
        const {
          name,
          price,
          desc,
          discount_price,
          discount_threshold,
          count_unit,
          currency_unit,
          home_banner,
          home_display,
          category_id,
          series_id,
          icon_url,
          desc_url,
          banner_url
        } = props.data
        const editModeFormData: LocalFormData = { ...addModeFormData } // 默认值
        editModeFormData.name = name
        editModeFormData.price = price
        editModeFormData.desc = desc
        editModeFormData.discount_price = discount_price
        editModeFormData.discount_threshold = discount_threshold
        editModeFormData.count_unit = count_unit
        editModeFormData.currency_unit = currency_unit
        editModeFormData.home_banner = home_banner
        editModeFormData.home_display = home_display
        editModeFormData.cs_cascader = [category_id, series_id]
        editModeFormData.icon_url = icon_url
        editModeFormData.desc_url = desc_url
        editModeFormData.banner_url = banner_url
        setFormData(editModeFormData)
        form.setFieldsValue(editModeFormData)
      } else {
        // console.log('mode === 1');
        setFormData(addModeFormData)
        form.setFieldsValue(addModeFormData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible, props.mode])

  // 类别 & 系列数据
  const categoryData = useSelector((state: any) => state.home.category)

  /*
   * !!!@Note
   * setFieldsValue 不会触发 onFieldsChange 和 onValuesChange
   * change 事件仅当用户交互才会触发。该设计是为了防止在 change 事件中调用 setFieldsValue 导致的循环问题。
   * 所以，要实现【缩略图】【轮播图】【描述图】的双向绑定，就需要设置其他对象以实现
   * 此处，设置的是初始化数据对象 formData 中对应的字段
   */

  // 缩略图，上传后的回调
  const uploadIconSuccess = (path: string) => {
    // console.log('uploadIconSuccess => ', path);
    const newFormData = { ...formData, icon_url: path }
    setFormData(newFormData)
    form.setFieldsValue({ icon_url: path })
  }

  // 轮播图片，上传后的回调
  const uploadBannerSuccess = (path: string, index: number) => {
    // console.log('uploadBannerSuccess => ', path, index);
    const banner_url = [...formData.banner_url]
    banner_url.splice(index, 1, path)
    const newFormData = { ...formData, banner_url }
    setFormData(newFormData)
    form.setFieldsValue({ banner_url })
  }

  // 描述图片，上传后的回调
  const uploadDescSuccess = (path: string, index: number) => {
    // console.log('uploadDescSuccess => ', path, index);
    const desc_url = [...formData.desc_url]
    desc_url.splice(index, 1, path)
    const newFormData = { ...formData, desc_url }
    setFormData(newFormData)
    form.setFieldsValue({ desc_url })
  }

  // 添加一项轮播图片
  const addBannerField = () => {
    const banner_url = [...formData.banner_url]
    banner_url.push('')
    const newFormData = { ...formData, banner_url }
    setFormData(newFormData)
    form.setFieldsValue({ banner_url })
  }

  // 删除一项轮播图片
  const removeBannerField = (index: number) => {
    // console.log('removeBannerField => ', index);
    const banner_url = [...formData.banner_url]
    if (banner_url.length <= 1) {
      message.warning('至少需要一张轮播图')
      return
    }
    banner_url.splice(index, 1)
    const newFormData = { ...formData, banner_url }
    setFormData(newFormData)
    form.setFieldsValue({ banner_url })
  }

  // 添加一项描述图片
  const addDescField = () => {
    const desc_url = [...formData.desc_url]
    desc_url.push('')
    const newFormData = { ...formData, desc_url }
    setFormData(newFormData)
    form.setFieldsValue({ desc_url })
  }

  // 删除一项描述图片
  const removeDescField = (index: number) => {
    // console.log('removeDescField => ', index);
    const desc_url = [...formData.desc_url]
    desc_url.splice(index, 1)
    const newFormData = { ...formData, desc_url }
    setFormData(newFormData)
    form.setFieldsValue({ desc_url })
  }

  // 保存：确定
  const handleSave = () => {
    // console.log('handleSave => ', form.getFieldsValue(true));
    form.validateFields().then(async (values: LocalFormData) => {
      // console.log('form.validateFields success => ', values);
      const [category_id, series_id] = values.cs_cascader
      const t_values: GoodsT & { cs_cascader?: string[] } = {
        ...values,
        category_id,
        series_id
      }
      const { banner_url, desc_url } = t_values
      // 最后选取的图片，如果未上传服务器，则对应的字段会变为系统路径字符串（如: C\Users\a.png）
      if (!(Array.isArray(banner_url) && Array.isArray(desc_url))) {
        message.error('轮播图或描述图，最后选取的图片未上传，请先上传服务器')
        return
      }
      const banner_url_filter = banner_url.filter((path: string) => path) // 过滤轮播图为空的项
      const desc_url_filter = desc_url.filter((path: string) => path) // 过滤描述图为空的项
      if (!banner_url_filter.length) {
        message.error('至少上传一张轮播图')
        return
      }
      if (Reflect.has(t_values, 'cs_cascader')) {
        // 删除级联字段
        Reflect.deleteProperty(t_values, 'cs_cascader')
      }

      t_values.banner_url = banner_url_filter // 设置过滤空项后的值
      t_values.desc_url = desc_url_filter // 设置过滤空项后的值

      if (props.mode === 1) {
        // 添加模式
        const params_add: GoodsT = t_values
        // console.log('params_add => ', params_add);
        const res = await addGoods(params_add)
        if (res?.error_code === '00') {
          message.success('添加成功')
          props.hideAEModal(true)
        } else {
          message.error(res?.error_msg ?? '')
        }
      } else if (props.mode === 2 && props.data) {
        // 编辑模式，只需要传改动的字段 和 _id
        const legacy = props.data
        const params_edit: Partial<GoodsT> = {}
        params_edit._id = legacy._id
        // console.log('params_edit => ', params_edit);
        const keys2Params = (Reflect.ownKeys(t_values) as string[]).filter(
          (key) => !isEqual(t_values[key], legacy[key])
        )
        if (keys2Params.length <= 0) {
          message.warning('没改动，无需保存')
          return
        }
        keys2Params.forEach((key) => {
          params_edit[key] = t_values[key]
        })
        const res = await editGoods(params_edit)
        if (res?.error_code === '00') {
          message.success('编辑成功')
          props.hideAEModal(true)
        } else {
          message.error(res?.error_msg ?? '')
        }
      }
    })
  }

  // 保存：取消
  const handleCancel = () => {
    // console.log('handleCancel');
    props.hideAEModal()
  }

  return (
    <div className={styles.container}>
      <Modal
        width={800}
        destroyOnClose
        getContainer={false} // 挂载在当前 div 节点下，而不是 document.body
        title={props.mode === 1 ? '添加商品' : '编辑商品'}
        okText={props.mode === 1 ? '提交' : '保存'}
        cancelText="取消"
        visible={props.visible}
        onOk={handleSave}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          colon={false}
          size="middle"
          autoComplete="off"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          initialValues={formData}
        >
          <Form.Item
            validateFirst
            label="商品名称"
            name="name"
            rules={[
              { required: true, message: '请输入商品名称' },
              { type: 'string', whitespace: true, message: '不能只输入空格符' }
            ]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item
            validateFirst
            label="商品价格"
            name="price"
            rules={[{ required: true, message: '请输入商品价格' }]}
          >
            <InputNumber min={0.01} />
          </Form.Item>
          <Form.Item
            validateFirst
            label="折扣数量"
            name="discount_threshold"
            rules={[{ required: true, message: '到达一定数量后享受折扣价' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            validateFirst
            label="折后价格"
            name="discount_price"
            rules={[{ required: true, message: '请输入折后价格' }]}
          >
            <InputNumber min={0.01} />
          </Form.Item>
          <Form.Item
            validateFirst
            label="数量单位"
            name="count_unit"
            rules={[{ required: true, message: '请输入商品计量单位' }]}
          >
            <Input placeholder="个" />
          </Form.Item>
          <Form.Item
            validateFirst
            label="货币种类"
            name="currency_unit"
            rules={[{ required: true, message: '请输入商品货币种类' }]}
          >
            <Input placeholder="￥、$" />
          </Form.Item>
          <Form.Item validateFirst label="主页轮播" name="home_banner">
            <Radio.Group name="home_banner_radio_group">
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item validateFirst label="主页显示" name="home_display">
            <Radio.Group name="home_display_radio_group">
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            validateFirst
            label="类别系列"
            name="cs_cascader"
            rules={[
              { required: true, message: '请选择所属类别和所属系列' },
              () => ({
                validator(_, value: string[]) {
                  if (value.length === 2 && value.every((i) => i.trim())) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('必须同时存在类别和系列'))
                }
              })
            ]}
          >
            <Cascader
              options={categoryData}
              placeholder="请选择商品所属类别和系列"
            />
          </Form.Item>
          <Form.Item
            validateFirst
            label="缩略图片"
            name="icon_url"
            rules={[{ required: true, message: '请上传一张缩略图' }]}
          >
            <LocalUpload
              filePath={formData.icon_url}
              uploadSuccess={uploadIconSuccess}
            />
          </Form.Item>
          <Form.Item
            validateFirst
            label="轮播图片"
            name="banner_url"
            rules={[{ required: true, message: '至少上传一张轮播图' }]}
          >
            <div className={styles['banner-box']}>
              {formData.banner_url.map((url: string, i: number) => (
                <div className={styles['upload-box']} key={`${url}${i}`}>
                  <LocalUpload
                    filePath={url}
                    uploadSuccess={(path) => uploadBannerSuccess(path, i)}
                  />
                  <MinusCircleOutlined onClick={() => removeBannerField(i)} />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={addBannerField}
                style={{ width: '50%' }}
                icon={<PlusOutlined />}
              >
                添加轮播图选项
              </Button>
            </div>
          </Form.Item>
          <Form.Item validateFirst label="描述图片" name="desc_url">
            <div className={styles['descurl-box']}>
              {formData.desc_url.map((url: string, i: number) => (
                <div className={styles['upload-box']} key={`${url}${i}`}>
                  <LocalUpload
                    filePath={url}
                    uploadSuccess={(path) => uploadDescSuccess(path, i)}
                  />
                  {/* 允许删除所有选项，不需判断 descUrl.length > 1 */}
                  <MinusCircleOutlined onClick={() => removeDescField(i)} />
                </div>
              ))}

              <Button
                type="dashed"
                onClick={addDescField}
                style={{ width: '50%' }}
                icon={<PlusOutlined />}
              >
                添加描述图选项
              </Button>
            </div>
          </Form.Item>
          <Form.Item
            validateFirst
            label="商品描述"
            name="desc"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <Input.TextArea rows={5} placeholder="请输入商品描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AEGModal
