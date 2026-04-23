import { useState } from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getCustomerAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function CustomerWisePage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'customer', filters],
    queryFn: () => getCustomerAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const top10 = rows.slice(0, 10);
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 120 },
    xAxis: { type: 'value', name: 'TCV USD M' },
    yAxis: { type: 'category', data: top10.map((r) => r.name).reverse() },
    series: [{
      type: 'bar',
      data: top10.map((r) => r.tcvUsdMillion.toFixed(2)).reverse(),
      itemStyle: { color: '#1677ff' },
      label: { show: true, position: 'right', formatter: (p: any) => `$${p.value}M` },
    }],
  };

  const columns = [
    { title: '#', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    { title: 'Customer', dataIndex: 'name' },
    { title: 'Segment', dataIndex: 'segment' },
    { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M`, sorter: (a: any, b: any) => a.tcvUsdMillion - b.tcvUsdMillion },
    { title: 'Count', dataIndex: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '%', dataIndex: 'percentage', render: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Customer-Wise Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Top 10 Customers by TCV" size="small">
            <ReactECharts option={chartOption} style={{ height: 320 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={`All Customers (Total: $${total.toFixed(2)}M)`} size="small">
            <Table dataSource={rows} columns={columns} rowKey="id" loading={isLoading} size="small"
              pagination={{ pageSize: 10, size: 'small' }} scroll={{ y: 280 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
