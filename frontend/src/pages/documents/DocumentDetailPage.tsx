import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Typography, Table, Spin, Row } from 'antd';
import { ArrowLeftOutlined, LinkOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getDocument } from '@/api/documents';
import { useAuthStore } from '@/stores/authStore';
import EditDocumentModal from './EditDocumentModal';

const { Title, Text } = Typography;

const typeColors: Record<string, string> = {
  PROPOSAL: 'blue', QUOTATION: 'cyan', CONTRACT: 'green', SPECIFICATION: 'geekblue',
  NDA: 'orange', MEETING_MINUTES: 'purple', PURCHASE_ORDER: 'magenta', INVOICE: 'gold',
  TECHNICAL_DOCUMENT: 'lime', CORRESPONDENCE: 'volcano', OTHER: 'default',
};

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id!),
  });

  if (isLoading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const doc = data?.data?.data as any;
  if (!doc) return <Text type="danger">Document not found</Text>;

  const canEdit = ['ADMIN', 'MANAGER', 'SALES'].includes(user?.role || '');

  const accessLogColumns = [
    { title: 'User', dataIndex: ['accessedBy', 'fullName'] },
    { title: 'Action', dataIndex: 'action' },
    {
      title: 'Date',
      dataIndex: 'accessedAt',
      render: (v: string) => new Date(v).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/documents')}>Back</Button>
          <Title level={4} style={{ margin: 0 }}>{doc.title}</Title>
        </Space>
        <Space>
          {canEdit && (
            <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          <Button
            type="primary"
            icon={<LinkOutlined />}
            href={doc.sharepointUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in SharePoint
          </Button>
        </Space>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered size="small">
          <Descriptions.Item label="Type">
            <Tag color={typeColors[doc.documentType] || 'default'}>{doc.documentType?.replace(/_/g, ' ')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="File Name">{doc.fileName}</Descriptions.Item>
          <Descriptions.Item label="File Size">{doc.fileSizeKb ? `${doc.fileSizeKb} KB` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Version">{doc.version || '-'}</Descriptions.Item>
          <Descriptions.Item label="MIME Type">{doc.mimeType || '-'}</Descriptions.Item>
          <Descriptions.Item label="Confidential">{doc.isConfidential ? 'Yes' : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Customer">{doc.customer?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Opportunity">
            {doc.opportunity ? `#${doc.opportunity.serialNumber} — ${doc.opportunity.description}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Received Date">
            {doc.receivedDate ? new Date(doc.receivedDate).toLocaleDateString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Received By">{doc.receivedBy?.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Uploaded By">{doc.uploadedBy?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Uploaded At">
            {new Date(doc.createdAt).toLocaleString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Tags" span={3}>
            {doc.tags?.length ? doc.tags.map((t: string) => <Tag key={t}>{t}</Tag>) : '-'}
          </Descriptions.Item>
          {doc.description && (
            <Descriptions.Item label="Description" span={3}>{doc.description}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {doc.accessLogs?.length > 0 && (
        <Card title="Access Log" size="small">
          <Table
            dataSource={doc.accessLogs}
            columns={accessLogColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <EditDocumentModal open={editOpen} document={doc} onClose={() => setEditOpen(false)} />
    </div>
  );
}
