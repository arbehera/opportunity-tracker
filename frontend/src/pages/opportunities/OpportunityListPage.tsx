import { useState } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Row, Col, Card, Typography,
  Tooltip, message,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getOpportunities, exportOpportunities } from '@/api/opportunities';
import { useMasterData } from '@/hooks/useMasterData';
import { useAuthStore } from '@/stores/authStore';
import type { OpportunityFilters } from '@/types';

const { Title } = Typography;

const stageColors: Record<string, string> = {
  SECURED: '#065f46', 'O(L)': '#7f1d1d', 'O(H)': '#4c1d95',
  A: '#374151', B: '#1e3a8a', C: '#0f4c5c', D: '#92400e', E: '#7c2d12', F: '#14532d',
};

export default function OpportunityListPage() {
  const navigate = useNavigate();
  useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { customers, businessUnits, dealStages, confidenceLevels } = useMasterData();

  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, limit: 25 });

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => getOpportunities(filters),
  });

  const handleExport = async () => {
    const res = await exportOpportunities(filters);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opportunities.xlsx';
    a.click();
  };

  const canEdit = ['ADMIN', 'MANAGER', 'SALES'].includes(user?.role || '');

  const pagination = data?.data?.pagination;
  const opps = (data?.data?.data || []) as any[];

  const columns = [
    { title: 'S.No', dataIndex: 'serialNumber', width: 70, sorter: true },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (v: string) => <Tooltip title={v}>{v}</Tooltip>,
    },
    { title: 'BU', dataIndex: ['businessUnit', 'name'], width: 70 },
    { title: 'Category', dataIndex: ['productCategory', 'name'], width: 100, ellipsis: true },
    { title: 'Subcategory', dataIndex: ['productSubcategory', 'name'], width: 120, ellipsis: true },
    {
      title: 'Stage',
      dataIndex: ['dealStage', 'code'],
      width: 85,
      render: (v: string) => <Tag color={stageColors[v] || '#374151'}>{v}</Tag>,
    },
    {
      title: 'Confidence',
      dataIndex: ['confidenceLevel', 'name'],
      width: 100,
      render: (v: string) => {
        const colors: Record<string, string> = { High: '#065f46', Mid: '#78350f', Low: '#9a3412', Secured: '#0f4c5c', Lost: '#7f1d1d' };
        return <Tag color={colors[v] || '#374151'}>{v}</Tag>;
      },
    },
    {
      title: 'TCV (USD M)',
      dataIndex: 'tcvUsdMillion',
      width: 110,
      sorter: true,
      render: (v: number) => <strong>${Number(v).toFixed(2)}M</strong>,
    },
    { title: 'PIN Sales', dataIndex: ['pinSales', 'fullName'], width: 120, ellipsis: true },
    {
      title: 'Est. Closure',
      dataIndex: 'estimatedClosureDate',
      width: 110,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/opportunities/${record.id}`)} />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/opportunities/${record.id}/edit`)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Opportunities</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export Excel</Button>
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/opportunities/new')}>
              New Opportunity
            </Button>
          )}
        </Space>
      </Row>

      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={[8, 8]}>
          <Col flex={1}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              allowClear
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder="Customer"
              style={{ minWidth: 160 }}
              value={filters.customerIds}
              onChange={(v) => setFilters((f) => ({ ...f, customerIds: v, page: 1 }))}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              maxTagCount="responsive"
              allowClear
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder="BU"
              style={{ minWidth: 100 }}
              value={filters.businessUnitIds}
              onChange={(v) => setFilters((f) => ({ ...f, businessUnitIds: v, page: 1 }))}
              options={businessUnits.map((b) => ({ value: b.id, label: b.name }))}
              maxTagCount="responsive"
              allowClear
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder="Stage"
              style={{ minWidth: 120 }}
              value={filters.dealStageIds}
              onChange={(v) => setFilters((f) => ({ ...f, dealStageIds: v, page: 1 }))}
              options={dealStages.map((s) => ({ value: s.id, label: s.code }))}
              maxTagCount="responsive"
              allowClear
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder="Confidence"
              style={{ minWidth: 130 }}
              value={filters.confidenceLevelIds}
              onChange={(v) => setFilters((f) => ({ ...f, confidenceLevelIds: v, page: 1 }))}
              options={confidenceLevels.map((c) => ({ value: c.id, label: c.name }))}
              maxTagCount="responsive"
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={opps}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1400 }}
        size="small"
        pagination={{
          current: pagination?.page || 1,
          pageSize: pagination?.limit || 25,
          total: pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (t) => `${t} opportunities`,
          onChange: (page, pageSize) => setFilters((f) => ({ ...f, page, limit: pageSize })),
        }}
        onChange={(_, __, sorter: any) => {
          if (sorter.field) {
            setFilters((f) => ({
              ...f,
              sortBy: Array.isArray(sorter.field) ? sorter.field.join('.') : sorter.field,
              sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
            }));
          }
        }}
      />
    </div>
  );
}
