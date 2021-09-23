/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { FC, useState, useRef } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  Table,
  Space,
  Button,
  Modal,
  message,
  Popconfirm,
  Drawer,
  Carousel,
} from 'antd';
import {
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { GoodsT } from '@/@types/goods';
import type { ColumnType } from 'rc-table/lib/interface';
import { useRequest } from 'ahooks';
import { fetchAllGoods, deleteGoods } from '@/api/goods';
import classNames from 'classnames';
import { formatDate } from '@/utils';
import AEGModal from './AEGModal';
import styles from './Goods.module.scss';
import type { CarouselRef } from 'antd/lib/carousel';

const Goods: FC<RouteComponentProps> = () => {
  const initOvData = {
    name: '',
    price: 1,
    desc: '',
    discount_price: 1,
    discount_threshold: 1,
    count_unit: '',
    currency_unit: '￥',
    home_banner: false,
    home_display: false,
    series_id: '',
    category_id: '',
    icon_url: '',
    desc_url: [''],
    banner_url: [''],
  };
  const [gt, setGt] = useState(0); // 为了触发获取商品请求
  const [page_index, setPageIndex] = useState(1);
  const [aegMode, setAEGMode] = useState(1); // 1：添加，2：编辑
  const [aegVisible, setAEGVisible] = useState(false);
  const [aegData, setAEGData] = useState<GoodsT | null>(null);
  const [page_size, setPageSize] = useState(10);
  const [ovVisible, setOVVisible] = useState(false);
  const [selectionIds, setSelectionIds] = useState<React.Key[]>([]);
  const [selectionRows, setSelectionRows] = useState<Required<GoodsT>[]>([]);
  // const [ovData, setOVData] = useState<GoodsT & Record<string, any>>(initOvData);
  const [ovData, setOVData] = useState<GoodsT>(initOvData);
  const carouselEl = useRef<CarouselRef>(null);

  // 获取所有商品
  const { data, loading: fetchAllGoodsLoading } = useRequest(
    fetchAllGoods.bind(null, { page_index, page_size }),
    {
      throwOnError: true,
      refreshDeps: [gt, page_index, page_size],
      formatResult({ data: { res, total, page_index, page_size } }) {
        // 格式化接口返回的数据
        // console.log('formatResult => ', res);
        const goods = res.map((item: GoodsT, index: number) => {
          const sequence = `0${(page_index - 1) * page_size + index + 1}`.slice(
            -2
          ); // 序号
          const {
            _id: key,
            home_banner,
            home_display,
            create_time,
            update_time,
            series_data: {
              0: { name: series_name },
            },
            category_data: {
              0: { name: category_name },
            },
          } = item;
          return {
            ...item,
            key,
            sequence,
            series_name,
            category_name,
            is_home_banner: home_banner ? '是' : '否',
            is_home_display: home_display ? '是' : '否',
            create_time: create_time && formatDate(create_time),
            update_time: update_time && formatDate(update_time),
          };
        });
        return { goods, total, page_index, page_size };
      },
      onError(error) {
        console.log('Goods.tsx fetchAllGoods error => ', error);
      },
    }
  );

  const pageNumChange = (page_index: number) => {
    // console.log('pageNumChange ', page_index);
    setPageIndex(page_index);
  };
  const pageSizeChange = (page_index: number, page_size: number) => {
    // console.log('pageSizeChange ', page_index, page_size);
    setPageSize(page_size);
  };

  // 隐藏 modal
  const hideAEModal = (refreshData: boolean = false) => {
    setAEGVisible(false);
    if (refreshData) setGt(gt + 1);
  };

  // 添加
  const addGoods = () => {
    // console.log('addGoods');
    setAEGMode(1);
    setAEGData(null);
    setAEGVisible(true);
  };

  // 预览
  const overviewGoods = (record: GoodsT) => {
    // console.log('overviewGoods => ', record);
    setOVVisible(true);
    setOVData(record);
  };

  const handleOVClose = () => {
    setOVVisible(false);
  };

  // 编辑
  const editGoods = (record: Required<GoodsT>) => {
    // console.log('editGoods => ', record);
    setAEGMode(2);
    setAEGData(record);
    setAEGVisible(true);
  };

  // 删除：单个
  const handleDelete = (id: string) => {
    // console.log('handleDelete', [id]);
    handleDeleteRequest([id]);
  };

  // 删除：多个
  const handleDeleteMulti = () => {
    // console.log('handleDeleteMulti => ', selectionIds, selectionRows);
    Modal.confirm({
      width: 600,
      title: '删除提示',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <div>确定删除以下商品吗：</div>
          <div>
            {selectionRows.map((item, i) => {
              if (i === 0) return <a key={item._id}>{item.name}</a>;
              return <a key={item._id}>、{item.name}</a>;
            })}
          </div>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        handleDeleteRequest();
      },
    });
  };

  // 删除：请求
  const handleDeleteRequest = async (
    ids: React.Key[] | string[] = selectionIds
  ) => {
    // console.log('handleDeleteRequest', ids);
    try {
      const res = await deleteGoods({ ids });
      if (res?.error_code === '00') {
        message.success('删除成功');
        if (page_index !== 1) {
          // page-index 或 gt，只要一个更新就可以重新请求数据
          setPageIndex(1);
        } else {
          setGt(gt + 1);
        }
      } else {
        message.error(res?.error_msg ?? '');
      }
    } catch (error: any) {
      // 捕获网络故障的错误
      message.error(error);
    }
  };

  // 表格列定义
  const columns: ColumnType<Required<GoodsT>>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      key: 'sequence',
      align: 'center',
      width: 50,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: 100,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 65,
    },
    {
      title: '折扣数量',
      dataIndex: 'discount_threshold',
      key: 'discount_threshold',
      align: 'center',
      width: 75,
    },
    {
      title: '折扣价',
      dataIndex: 'discount_price',
      key: 'discount_price',
      align: 'center',
      width: 65,
    },
    {
      title: '单位',
      dataIndex: 'count_unit',
      key: 'count_unit',
      align: 'center',
      width: 50,
    },
    {
      title: '货币',
      dataIndex: 'currency_unit',
      key: 'currency_unit',
      align: 'center',
      width: 50,
    },
    {
      title: '类别',
      dataIndex: 'category_name',
      key: 'category_name',
      align: 'center',
      width: 80,
    },
    {
      title: '系列',
      dataIndex: 'series_name',
      key: 'series_name',
      align: 'center',
      width: 80,
    },
    {
      title: '主页轮播',
      dataIndex: 'is_home_banner',
      key: 'is_home_banner',
      align: 'center',
      width: 80,
    },
    {
      title: '主页展示',
      dataIndex: 'is_home_display',
      key: 'is_home_display',
      align: 'center',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      align: 'center',
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      align: 'center',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      align: 'left',
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
            type='link'
            onClick={() => overviewGoods(record)}
          >
            预览
          </Button>
          <Button
            className={styles['operation-btn']}
            type='link'
            onClick={() => editGoods(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title='确定删除?'
            okText='确认'
            cancelText='取消'
            onConfirm={() => handleDelete(record._id)}
          >
            <Button className={styles['operation-btn']} type='link'>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h4 className={styles.title}>商品</h4>
        <div>
          {selectionIds.length ? (
            <Button
              danger
              size='middle'
              style={{ marginRight: '15px' }}
              onClick={handleDeleteMulti}
            >
              删除
            </Button>
          ) : null}
          <Button type='primary' size='middle' onClick={addGoods}>
            添加
          </Button>
        </div>
      </header>
      <section className={styles.section}>
        <Table
          size='small'
          loading={fetchAllGoodsLoading}
          columns={columns}
          dataSource={data?.goods ?? []}
          rowSelection={{
            type: 'checkbox',
            onChange: (
              selectedRowKeys: React.Key[],
              selectedRows: Required<GoodsT>[]
            ) => {
              // console.log('selectedRowKeys =>', selectedRowKeys);
              setSelectionIds(selectedRowKeys);
              setSelectionRows(selectedRows);
            },
          }}
          pagination={{
            showSizeChanger: true, // 是否可以改变 pageSize boolean
            // total: 803, // 调试使用
            total: data?.total ?? 0, // 数据总数 number
            current: data?.page_index ?? 1, // 当前页数 number
            onChange: pageNumChange, // 页码改变的回调，参数是改变后的页码及每页条数 Function(page, pageSize)
            pageSizeOptions: ['10', '15', '20', '50'], // 指定每页可以显示多少条 string[]
            onShowSizeChange: pageSizeChange, // pageSize 变化的回调 Function(current, size)
            // showTotal: total => (`共 ${total} 条数据`), // 调试使用
            showTotal: (total) => `共 ${data?.total ?? 0} 条数据`, // 用于显示数据总量和当前数据顺序 Function(total, range)
          }}
        />
      </section>
      <Drawer
        title='iPhone X 模拟器'
        width={425}
        destroyOnClose
        onClose={handleOVClose}
        visible={ovVisible}
        getContainer={false} // 挂载在当前 div 节点下，而不是 document.body
      >
        <div className={styles['phone-emulator']}>
          <div className={styles['carousel-box']}>
            <div
              className={classNames(styles['carousel-trigger'], styles.left)}
              onClick={() => carouselEl.current?.prev()}
            >
              <LeftOutlined />
            </div>
            <div
              className={classNames(styles['carousel-trigger'], styles.right)}
              onClick={() => carouselEl.current?.next()}
            >
              <RightOutlined />
            </div>
            <Carousel ref={carouselEl}>
              {ovData.banner_url.map((url) => (
                <div className={styles['carousel-item']} key={url}>
                  <img alt='banner-url' src={url} />
                </div>
              ))}
            </Carousel>
          </div>
          <div className={styles['price-area']}>
            <div className={styles['price-info']}>
              <span className={styles.price}>
                {ovData.currency_unit}
                {ovData.price}
              </span>
              <span className={styles.unit}>/{ovData.count_unit}</span>
            </div>
            <div className={styles['price-discount']}>
              <span>
                {ovData.currency_unit}
                {ovData.discount_price}
              </span>
              <span>
                /{ovData.discount_threshold}
                {ovData.count_unit}
              </span>
            </div>
            <div className={styles.desc}>{ovData.desc}</div>
          </div>
          <div className={styles['desc-box']}>
            {ovData.desc_url.map((url) => (
              <div className={styles['img-wrapper']} key={url}>
                <img alt='desc-url' src={url} />
              </div>
            ))}
          </div>
        </div>
      </Drawer>
      <AEGModal
        mode={aegMode}
        visible={aegVisible}
        hideAEModal={hideAEModal}
        data={aegData}
      />
    </div>
  );
};

export default Goods;
