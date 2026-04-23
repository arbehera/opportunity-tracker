import { useState } from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getCountAnalytics } from '@/api/analytics';
import type { AnalyticsFilters } from '@/api/analytics';
import AnalyticsFiltersPanel from '@/components/analytics/AnalyticsFilters';

const { Title } = Typography;

export default function OpportunityCountPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'count', filters],
    queryFn: () => getCountAnalytics(filters),
  });

  const counts = (data?.data?.data || {}) as { byBU?: any[]; byCategory?: any[]; byStage?: any[] };

  const makeBarOption = (items: any[], color: string) => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: items.map((r) => r.name) },
    yAxis: { type: 'value', name: 'Count' },
    series: [{
      type: 'bar',
      data: items.map((r) => r.count),
      itemStyle: { color },
      label: { show: true, position: 'top' },
    }],
  });

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Opportunity Count Analytics</Title>
      <AnalyticsFiltersPanel filters={filters} onChange={setFilters} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Count by Business Unit" size="small">
            <ReactECharts
              option={makeBarOption(counts.byBU || [], '#1677ff')}
              style={{ height: 280 }}
              showLoading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Count by Category" size="small">
            <ReactECharts
              option={makeBarOption(counts.byCategory || [], '#52c41a')}
              style={{ height: 280 }}
              showLoading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Count by Stage" size="small">
            <ReactECharts
              option={makeBarOption(counts.byStage || [], '#722ed1')}
              style={{ height: 280 }}
              showLoading={isLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
