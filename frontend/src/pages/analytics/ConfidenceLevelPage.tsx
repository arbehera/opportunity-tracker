import { useState } from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getConfidenceAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

const confColors: Record<string, string> = {
  High: '#52c41a', Mid: '#faad14', Low: '#ff4d4f', Secured: '#1677ff', Lost: '#d9d9d9',
};

export default function ConfidenceLevelPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'confidence', filters],
    queryFn: () => getConfidenceAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const pieOption = {
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>$${p.value}M (${p.percent}%)` },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      data: rows.map((r) => ({
        name: r.name,
        value: r.tcvUsdMillion.toFixed(2),
        itemStyle: { color: confColors[r.name] },
      })),
      label: { formatter: '{b}\n${c}M' },
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: rows.map((r) => r.name) },
    yAxis: { type: 'value', name: 'Count' },
    series: [{
      type: 'bar',
      data: rows.map((r) => ({ value: r.count, itemStyle: { color: confColors[r.name] || '#1677ff' } })),
      label: { show: true, position: 'top' },
    }],
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Confidence Level Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={`TCV by Confidence (Total: $${total.toFixed(2)}M)`} size="small">
            <ReactECharts option={pieOption} style={{ height: 300 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Opportunity Count by Confidence" size="small">
            <ReactECharts option={barOption} style={{ height: 300 }} showLoading={isLoading} />
          </Card>
        </Col>
      </Row>
      <Card title="Confidence Breakdown" size="small">
        <Table
          dataSource={rows}
          rowKey="id"
          size="small"
          pagination={false}
          loading={isLoading}
          columns={[
            { title: 'Confidence Level', dataIndex: 'name' },
            { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M` },
            { title: 'Count', dataIndex: 'count' },
            { title: '% TCV', dataIndex: 'percentage', render: (v: number) => `${v.toFixed(1)}%` },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><strong>${total.toFixed(2)}M</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><strong>{rows.reduce((s, r) => s + r.count, 0)}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={3}>100%</Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}
