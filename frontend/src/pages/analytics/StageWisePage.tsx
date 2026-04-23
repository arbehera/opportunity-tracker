import { useState } from 'react';
import { Card, Table, Typography, Tag, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getStageAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

const stageColors: Record<string, string> = {
  SECURED: '#52c41a', 'O(L)': '#ff4d4f', 'O(H)': '#faad14',
  A: '#d9d9d9', B: '#1677ff', C: '#13c2c2', D: '#2f54eb', E: '#722ed1', F: '#eb2f96',
};

export default function StageWisePage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'stage', filters],
    queryFn: () => getStageAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const chartOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: rows.map((r) => r.code) },
    yAxis: [
      { type: 'value', name: 'TCV USD M', position: 'left' },
      { type: 'value', name: 'Count', position: 'right' },
    ],
    series: [
      {
        name: 'TCV USD M',
        type: 'bar',
        data: rows.map((r) => ({ value: r.tcvUsdMillion.toFixed(2), itemStyle: { color: stageColors[r.code] || '#1677ff' } })),
        yAxisIndex: 0,
      },
      {
        name: 'Count',
        type: 'line',
        data: rows.map((r) => r.count),
        yAxisIndex: 1,
        itemStyle: { color: '#faad14' },
      },
    ],
    legend: { data: ['TCV USD M', 'Count'] },
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', render: (v: string) => <Tag color={stageColors[v] || 'default'}>{v}</Tag> },
    { title: 'Classification', dataIndex: 'classification' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M`, sorter: (a: any, b: any) => a.tcvUsdMillion - b.tcvUsdMillion },
    { title: 'Count', dataIndex: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '%', dataIndex: 'percentage', render: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Stage-Wise Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Card title={`TCV by Stage (Total: $${total.toFixed(2)}M)`} size="small" style={{ marginBottom: 16 }}>
        <ReactECharts option={chartOption} style={{ height: 320 }} showLoading={isLoading} />
      </Card>
      <Card title="Stage Breakdown" size="small">
        <Table dataSource={rows} columns={columns} rowKey="id" loading={isLoading} size="small" pagination={false} />
      </Card>
    </div>
  );
}
