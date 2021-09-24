import React, { FC, useRef, useState } from 'react'
import { Button, Input, message } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'
import styles from './Upload.module.scss'
import { upload } from '@/api/shared'
interface LocalProps {
  filePath?: string
  labelWidth?: number
  maxSize?: number
  labelText?: string
  uploadSuccess?: (...args: any[]) => any
}

const Upload: FC<LocalProps> = (props) => {
  const fileInputEl = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)

  // 触发-选取图片
  const pickupFile = () => {
    fileInputEl.current?.click()
  }

  // 选取图片
  /* interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
  }
  若用此接口作为类型，会报不兼容错误
  */
  const fileChangeEvent = (ev: any) => {
    // console.log('fileChangeEvent => ', ev);
    const imgFile = ev?.target?.files?.[0]
    if (imgFile) {
      const { size, type } = imgFile
      const typeReg = /(png|jpe?g|webp|gif)$/
      if (!typeReg.test(type)) {
        message.error('请上传以下格式的图片：jpg/jpeg/png/webp/gif')
      } else if (props.maxSize && size / 1000 > props.maxSize) {
        message.error(`大小不超过 ${props.maxSize}kb`)
      } else {
        setFile(imgFile) // 保存文件对象
        message.info('图片准备就绪')
      }
    }
  }
  // 上传文件到服务器
  const uploadFile = async () => {
    if (file) {
      const formData = new FormData()
      formData.append('picture', file)
      setUploadLoading(true)

      const result = await upload(formData)
      setUploadLoading(false)
      if (result?.error_code === '00') {
        const path = result.data?.res ?? ''
        setFile(null)
        // 先执行组件内的操作(setFile(null))，然后执行父组件操作(callback)
        // 否则，本组件内无原因自己更新状态，就会警告内存泄漏，而不进行操作 no-op
        message.success('图片上传成功')
        if (props.uploadSuccess) props.uploadSuccess(path)
      }
    }
  }
  return (
    <div className={styles.upload}>
      <div className={styles.layout}>
        {props.labelText ? (
          <div
            className={styles.label}
            style={{ width: `${props.labelWidth ?? 100}px` }}
          >
            {props.labelText}
          </div>
        ) : null}
        <div className={styles['iput-group']}>
          <Input
            title={props.filePath}
            className={styles['icon-name']}
            value={props.filePath}
            readOnly
            placeholder="请先上传服务器"
          />
          <input
            type="file"
            className={styles['icon-file']}
            ref={fileInputEl}
            onChange={fileChangeEvent}
            accept="image/jpeg, image/png, image/gif"
          />
        </div>
        <div className={styles['btn-group']}>
          <Button type="primary" size="small" onClick={pickupFile}>
            选择图片
          </Button>
          {!!file ? (
            <Button
              type="primary"
              size="small"
              icon={<CloudUploadOutlined />}
              loading={uploadLoading}
              onClick={uploadFile}
            >
              上传服务器
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

Upload.defaultProps = {
  filePath: ''
}

export default Upload
