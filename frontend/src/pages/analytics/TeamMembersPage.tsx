import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getTeamAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function TeamMembersPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'team', filters],
    queryFn: () => getTeamAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 130 },
    xAxis: { type: 'value', name: 'TCV USD M' },
    yAxis: { type: 'category', data: rows.map((r) => r.name).reverse() },
    series: [
      {
        name: 'TCV USD M',
        type: 'bar',
        data: rows.map((r) => r.tcvUsdMillion.toFixed(2)).reverse(),
        itemStyle: { color: '#722ed1' },
        label: { show: true, position: 'right', formatter: (p: any) => `$${p.value}M` },
      },
    ],
  };

  const columns = [
    {
      title: '#',
      render: (_: any, __: any, i: number) => i + 1,
      width: 50,
    },
    {
      title: 'Sales Person',
      dataIndex: 'name',
      render: (v: string, r: any) => (
        <span>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, background: '#722ed1' }} />
          {v} {r.businessUnit && <span style={{ color: '#999', fontSize: 12 }}>({r.businessUnit})</span>}
        </span>
      ),
    },
    { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M`, sorter: (a: any, b: any) => a.tcvUsdMillion - b.tcvUsdMillion },
    { title: 'Count', dataIndex: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '% TCV', dataIndex: 'percentage', render: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Team Member Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={`TCV by Sales Person (Total: $${total.toFixed(2)}M)`} size="small">
            <ReactECharts option={chartOption} style={{ height: 320 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Team Leaderboard" size="small">
            <Table dataSource={rows} columns={columns} rowKey="id" loading={isLoading} size="small" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
