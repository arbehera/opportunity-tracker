import { useState } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Typography, Card, Row, Col, Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '@/api/documents';
import { useAuthStore } from '@/stores/authStore';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';

const { Title } = Typography;

const DOC_TYPES = [
  'PROPOSAL', 'QUOTATION', 'CONTRACT', 'SPECIFICATION', 'NDA',
  'MEETING_MINUTES', 'PURCHASE_ORDER', 'INVOICE', 'TECHNICAL_DOCUMENT',
  'CORRESPONDENCE', 'OTHER',
];

const typeColors: Record<string, string> = {
  PROPOSAL: 'blue', QUOTATION: 'cyan', CONTRACT: 'green', SPECIFICATION: 'geekblue',
  NDA: 'orange', MEETING_MINUTES: 'purple', PURCHASE_ORDER: 'magenta', INVOICE: 'gold',
  TECHNICAL_DOCUMENT: 'lime', CORRESPONDENCE: 'volcano', OTHER: 'default',
};

export default function DocumentListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState<string | undefined>();
  const [addOpen, setAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', { search, docType }],
    queryFn: () => getDocuments({ search: search || undefined, documentType: docType }),
  });

  const canEdit = ['ADMIN', 'MANAGER', 'SALES'].includes(user?.role || '');
  const docs = (data?.data?.data || []) as any[];

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
      render: (v: string, r: any) => (
        <a onClick={() => navigate(`/documents/${r.id}`)}>{v}</a>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'documentType',
      width: 160,
      render: (v: string) => <Tag color={typeColors[v] || 'default'}>{v.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      width: 130,
      render: (v: string) => v || '-',
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      ellipsis: true,
      width: 200,
      render: (v: string) => (
        <span style={{ fontSize: 12 }}>{v}</span>
      ),
    },
    {
      title: 'Uploaded By',
      dataIndex: ['uploadedBy', 'fullName'],
      width: 130,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 100,
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/documents/${r.id}`)} />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => setEditDoc(r)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Documents</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
          Add Document
        </Button>
      </Row>

      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={8}>
          <Col flex={1}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Document type"
              style={{ width: 180 }}
              value={docType}
              onChange={setDocType}
              allowClear
              options={DOC_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))}
            />
          </Col>
        </Row>
      </Card>

      <AddDocumentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditDocumentModal open={!!editDoc} document={editDoc} onClose={() => setEditDoc(null)} />

      <Table
        dataSource={docs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 20, showTotal: (t) => `${t} documents` }}
      />
    </div>
  );
}
