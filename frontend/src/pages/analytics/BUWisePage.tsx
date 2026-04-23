import { useState } from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getBUAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function BUWisePage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'bu', filters],
    queryFn: () => getBUAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const chartOption = {
    tooltip: { trigger: 'axis', formatter: (p: any[]) => `${p[0].name}<br/>TCV: $${p[0].value}M<br/>Count: ${rows.find(r => r.name === p[0].name)?.count}` },
    xAxis: { type: 'category', data: rows.map((r) => r.name) },
    yAxis: { type: 'value', name: 'TCV USD M' },
    series: [{
      type: 'bar',
      data: rows.map((r) => ({ value: r.tcvUsdMillion.toFixed(2), name: r.name })),
      itemStyle: { color: '#1677ff' },
      label: { show: true, position: 'top', formatter: (p: any) => `$${p.value}M` },
    }],
  };

  const columns = [
    { title: 'Business Unit', dataIndex: 'name' },
    { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M`, sorter: (a: any, b: any) => a.tcvUsdMillion - b.tcvUsdMillion },
    { title: 'Count', dataIndex: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '%', dataIndex: 'percentage', render: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Business Unit-Wise Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={`TCV by Business Unit (Total: $${total.toFixed(2)}M)`} size="small">
            <ReactECharts option={chartOption} style={{ height: 300 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="BU Breakdown" size="small">
            <Table dataSource={rows} columns={columns} rowKey="id" loading={isLoading} size="small" pagination={false}
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
        </Col>
      </Row>
    </div>
  );
}
