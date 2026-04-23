import { useState } from 'react';
import {
  Table, Button, Space, Tag, Typography, Modal, Form, Input, Select,
  Popconfirm, message, Switch, Card,
} from 'antd';
import { PlusOutlined, EditOutlined, PoweroffOutlined, KeyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deactivateUser, resetUserPassword } from '@/api/users';

const { Title } = Typography;

const ROLES = ['ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER'];
const roleColors: Record<string, string> = {
  ADMIN: 'red', MANAGER: 'orange', SALES: 'blue', PRESALES: 'purple', VIEWER: 'default',
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; user?: any }>({ open: false });
  const [pwModal, setPwModal] = useState<{ open: boolean; userId?: string }>({ open: false });
  const [form] = Form.useForm();
  const [pwForm] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => createUser(d),
    onSuccess: () => { message.success('User created'); queryClient.invalidateQueries({ queryKey: ['users'] }); setModal({ open: false }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => updateUser(id, data),
    onSuccess: () => { message.success('User updated'); queryClient.invalidateQueries({ queryKey: ['users'] }); setModal({ open: false }); },
    onError: (e: any) => message.error(e.response?.data?.message || 'Failed to update'),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => { message.success('User deactivated'); queryClient.invalidateQueries({ queryKey: ['users'] }); },
    onError: () => message.error('Failed to deactivate'),
  });

  const pwMut = useMutation({
    mutationFn: ({ id, password }: any) => resetUserPassword(id, password),
    onSuccess: () => { message.success('Password reset'); setPwModal({ open: false }); },
    onError: () => message.error('Failed to reset password'),
  });

  const openCreate = () => { form.resetFields(); setModal({ open: true }); };
  const openEdit = (user: any) => {
    form.setFieldsValue({ fullName: user.fullName, email: user.email, role: user.role, businessUnit: user.businessUnit });
    setModal({ open: true, user });
  };

  const onFormSubmit = (values: any) => {
    if (modal.user) updateMut.mutate({ id: modal.user.id, data: values });
    else createMut.mutate(values);
  };

  const users = (data?.data?.data || []) as any[];

  const columns = [
    { title: 'Name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (v: string) => <Tag color={roleColors[v] || 'default'}>{v}</Tag>,
    },
    { title: 'BU', dataIndex: 'businessUnit', render: (v: string) => v || '-' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: any) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button size="small" icon={<KeyOutlined />} onClick={() => setPwModal({ open: true, userId: r.id })} />
          {r.isActive && (
            <Popconfirm title="Deactivate this user?" onConfirm={() => deactivateMut.mutate(r.id)}>
              <Button size="small" danger icon={<PoweroffOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add User</Button>
      </div>

      <Table dataSource={users} columns={columns} rowKey="id" loading={isLoading} size="small" />

      <Modal
        open={modal.open}
        title={modal.user ? 'Edit User' : 'Create User'}
        onCancel={() => setModal({ open: false })}
        onOk={() => form.submit()}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!modal.user && (
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item label="Business Unit" name="businessUnit">
            <Input placeholder="e.g. MPC, MAC, MCC" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={pwModal.open}
        title="Reset Password"
        onCancel={() => setPwModal({ open: false })}
        onOk={() => pwForm.submit()}
        confirmLoading={pwMut.isPending}
      >
        <Form form={pwForm} layout="vertical" onFinish={(v) => pwMut.mutate({ id: pwModal.userId, password: v.password })}>
          <Form.Item label="New Password" name="password" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirm"
            dependencies={['password']}
            rules={[{ required: true }, ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject('Passwords do not match');
              },
            })]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
