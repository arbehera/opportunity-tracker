import { useState } from 'react';
import { Card, Table, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getSubcategoryAnalytics, getSubcategoryByBUAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function SubcategoryWisePage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'subcategory', filters],
    queryFn: () => getSubcategoryAnalytics(filters),
  });
  const { data: pivotRes } = useQuery({
    queryKey: ['analytics', 'subcategory-bu', filters],
    queryFn: () => getSubcategoryByBUAnalytics(filters),
  });

  const rows = (data?.data?.data || []) as any[];
  const pivot = pivotRes?.data?.data as { columns: string[]; rows: any[] } | undefined;

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 130 },
    xAxis: { type: 'value', name: 'TCV USD M' },
    yAxis: { type: 'category', data: rows.map((r) => r.name).reverse() },
    series: [{
      type: 'bar',
      data: rows.map((r) => r.tcvUsdMillion.toFixed(2)).reverse(),
      itemStyle: { color: '#13c2c2' },
      label: { show: true, position: 'right', formatter: (p: any) => `$${p.value}M` },
    }],
  };

  const pivotColumns = pivot?.columns
    ? [
        { title: 'Subcategory', dataIndex: 'rowLabel', fixed: 'left' as const, width: 140 },
        ...pivot.columns.map((col) => ({
          title: col,
          dataIndex: col,
          render: (v: number) => v ? `$${v.toFixed(2)}M` : '-',
        })),
      ]
    : [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Subcategory-Wise Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="TCV by Subcategory" size="small">
            <ReactECharts option={chartOption} style={{ height: 320 }} showLoading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Subcategory List" size="small">
            <Table
              dataSource={rows}
              rowKey="id"
              loading={isLoading}
              size="small"
              pagination={false}
              columns={[
                { title: 'Subcategory', dataIndex: 'name' },
                { title: 'Category', dataIndex: 'category' },
                { title: 'TCV USD M', dataIndex: 'tcvUsdMillion', render: (v: number) => `$${v.toFixed(2)}M` },
                { title: 'Count', dataIndex: 'count' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {pivot && (
        <Card title="Subcategory × BU Pivot" size="small">
          <Table
            dataSource={pivot.rows}
            columns={pivotColumns}
            rowKey="rowLabel"
            size="small"
            scroll={{ x: true }}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
