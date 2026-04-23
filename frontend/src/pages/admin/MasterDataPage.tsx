import { useState } from 'react';
import { Tabs, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography } from 'antd';
import {
  customersApi, productCategoriesApi, productSubcategoriesApi,
  businessCategoriesApi, businessUnitsApi, dealStagesApi, confidenceLevelsApi,
} from '@/api/master';

const { Title } = Typography;

type TabKey = 'customers' | 'productCategories' | 'productSubcategories' | 'businessCategories' | 'businessUnits' | 'dealStages' | 'confidenceLevels';

interface TabConfig {
  label: string;
  api: any;
  columns: any[];
  formFields: React.ReactNode;
  getInitial?: (r: any) => any;
}

function MasterTab({ config, queryKey }: { config: TabConfig; queryKey: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; record?: any }>({ open: false });
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['master', queryKey],
    queryFn: () => config.api.list(),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => config.api.create(d),
    onSuccess: () => { message.success('Created'); qc.invalidateQueries({ queryKey: ['master', queryKey] }); setModal({ open: false }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => config.api.update(id, data),
    onSuccess: () => { message.success('Updated'); qc.invalidateQueries({ queryKey: ['master', queryKey] }); setModal({ open: false }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => config.api.remove(id),
    onSuccess: () => { message.success('Deleted'); qc.invalidateQueries({ queryKey: ['master', queryKey] }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { form.resetFields(); setModal({ open: true }); };
  const openEdit = (r: any) => {
    form.setFieldsValue(config.getInitial ? config.getInitial(r) : r);
    setModal({ open: true, record: r });
  };
  const onSubmit = (values: any) => {
    if (modal.record) updateMut.mutate({ id: modal.record.id, data: values });
    else createMut.mutate(values);
  };

  const rows = (data?.data?.data || []) as any[];

  const actionsCol = {
    title: 'Actions',
    key: 'actions',
    width: 90,
    render: (_: any, r: any) => (
      <Space size={4}>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={() => removeMut.mutate(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  };

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>
      </div>
      <Table
        dataSource={rows}
        columns={[...config.columns, actionsCol]}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 15, size: 'small' }}
      />
      <Modal
        open={modal.open}
        title={modal.record ? 'Edit' : 'Add'}
        onCancel={() => setModal({ open: false })}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {config.formFields}
        </Form>
      </Modal>
    </div>
  );
}

export default function MasterDataPage() {
  const qc = useQueryClient();
  const { data: catData } = useQuery({ queryKey: ['master', 'productCategories'], queryFn: () => productCategoriesApi.list() });
  const categories = (catData?.data?.data || []) as any[];

  const tabConfigs: Record<TabKey, TabConfig> = {
    customers: {
      label: 'Customers',
      api: customersApi,
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Segment', dataIndex: 'segment', render: (v: string) => v || '-' },
        { title: 'Region', dataIndex: 'region', render: (v: string) => v || '-' },
        { title: 'Active', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
      ],
      formFields: (
        <>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Segment" name="segment"><Input placeholder="4W, 2W, CV..." /></Form.Item>
          <Form.Item label="Region" name="region"><Input /></Form.Item>
        </>
      ),
    },
    productCategories: {
      label: 'Product Categories',
      api: productCategoriesApi,
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Active', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
      ],
      formFields: <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>,
    },
    productSubcategories: {
      label: 'Subcategories',
      api: productSubcategoriesApi,
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Category', dataIndex: ['category', 'name'] },
        { title: 'Active', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
      ],
      formFields: (
        <>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
        </>
      ),
      getInitial: (r: any) => ({ name: r.name, categoryId: r.categoryId }),
    },
    businessCategories: {
      label: 'Biz Categories',
      api: businessCategoriesApi,
      columns: [{ title: 'Name', dataIndex: 'name' }],
      formFields: <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>,
    },
    businessUnits: {
      label: 'Business Units',
      api: businessUnitsApi,
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Description', dataIndex: 'description', render: (v: string) => v || '-' },
        { title: 'Active', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
      ],
      formFields: (
        <>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Description" name="description"><Input /></Form.Item>
        </>
      ),
    },
    dealStages: {
      label: 'Deal Stages',
      api: dealStagesApi,
      columns: [
        { title: 'Code', dataIndex: 'code', render: (v: string) => <Tag>{v}</Tag> },
        { title: 'Classification', dataIndex: 'classification' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Win Prob%', dataIndex: 'winningProbability', render: (v: any) => `${Number(v).toFixed(0)}%` },
        { title: 'Order', dataIndex: 'sortOrder' },
      ],
      formFields: (
        <>
          <Form.Item label="Code" name="code" rules={[{ required: true }]}><Input maxLength={20} /></Form.Item>
          <Form.Item label="Classification" name="classification" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Winning Probability %" name="winningProbability" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Sort Order" name="sortOrder" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </>
      ),
      getInitial: (r: any) => ({ ...r, winningProbability: Number(r.winningProbability) }),
    },
    confidenceLevels: {
      label: 'Confidence Levels',
      api: confidenceLevelsApi,
      columns: [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Sort Order', dataIndex: 'sortOrder' },
      ],
      formFields: (
        <>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Sort Order" name="sortOrder" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </>
      ),
    },
  };

  const tabItems = (Object.keys(tabConfigs) as TabKey[]).map((key) => ({
    key,
    label: tabConfigs[key].label,
    children: <MasterTab config={tabConfigs[key]} queryKey={key} />,
  }));

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Master Data Management</Title>
      <Tabs items={tabItems} />
    </div>
  );
}
