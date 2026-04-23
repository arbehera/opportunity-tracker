import { useState } from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getCategoryAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function CategoryWisePage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'category', filters],
    queryFn: () => getCategoryAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const total = rows.reduce((s, r) => s + r.tcvUsdMillion, 0);

  const chartOption = {
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>$${p.value}M (${p.percent}%)` },
    legend: { orient: 'vertical', right: 10, top: 'middle', formatter: (name: string) => {
      const r = rows.find((x) => x.name === name);
      return `${name}: $${r?.tcvUsdMillion?.toFixed(2)}M`;
    }},
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['35%', '50%'],
      data: rows.map((r) => ({ name: r.name, value: r.tcvUsdMillion.toFixed(2) })),
      label: { formatter: '{b}\n{d}%' },
    }],
  };

  const columns = [
    { title: 'Category', dataIndex: 'name', key: 'name' },
    {
      title: 'TCV USD M',
      dataIndex: 'tcvUsdMillion',
      key: 'tcv',
      render: (v: number) => `$${v.toFixed(2)}M`,
      sorter: (a: any, b: any) => a.tcvUsdMillion - b.tcvUsdMillion,
    },
    { title: 'Count', dataIndex: 'count', key: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '%', dataIndex: 'percentage', key: 'pct', render: (v: number) => `${v.toFixed(1)}%` },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Category-Wise Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={`TCV by Category  (Total: $${total.toFixed(2)}M)`} size="small">
            <ReactECharts option={chartOption} style={{ height: 300 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Category Breakdown" size="small">
            <Table
              dataSource={rows}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              size="small"
              pagination={false}
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
