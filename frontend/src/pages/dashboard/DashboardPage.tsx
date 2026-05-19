import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Tooltip, Badge } from 'antd';
import {
  FundOutlined, DollarOutlined, TrophyOutlined, RiseOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getDashboardSummary, getDashboardCharts, getStaleOpportunities } from '@/api/analytics';
import { getOpportunities } from '@/api/opportunities';

const { Title } = Typography;

function fmtTcv(v: number) {
  return `$${v.toFixed(2)}M`;
}

function staleBand(days: number): { color: string; label: string } {
  if (days >= 61) return { color: '#820014', label: `${days}d` };
  if (days >= 31) return { color: '#f5222d', label: `${days}d` };
  if (days >= 15) return { color: '#fa8c16', label: `${days}d` };
  return { color: '#faad14', label: `${days}d` };
}

export default function DashboardPage() {
  const { data: summaryRes, isLoading: summLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => getDashboardSummary(),
  });
  const { data: chartsRes } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: () => getDashboardCharts(),
  });
  const { data: recentRes } = useQuery({
    queryKey: ['opportunities', 'recent'],
    queryFn: () => getOpportunities({ limit: 8, page: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
  });
  const { data: staleRes } = useQuery({
    queryKey: ['analytics', 'stale'],
    queryFn: () => getStaleOpportunities(),
  });

  const summary = summaryRes?.data?.data;
  const charts = chartsRes?.data?.data;
  const recent = recentRes?.data?.data || [];
  const stale: any[] = staleRes?.data?.data || [];

  const buChartOption = charts?.buData?.length
    ? {
        tooltip: { trigger: 'item', formatter: '{b}: ${c}M ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'middle' },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['35%', '50%'],
          data: charts.buData.map((d: any) => ({ name: d.name, value: d.tcvUsdMillion.toFixed(2) })),
          label: { show: false },
        }],
      }
    : null;

  const stageChartOption = charts?.stageData?.length
    ? {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: charts.stageData.map((d: any) => d.code) },
        yAxis: { type: 'value', name: 'TCV USD M' },
        series: [{
          type: 'bar',
          data: charts.stageData.map((d: any) => d.tcvUsdMillion.toFixed(2)),
          itemStyle: { color: '#1677ff' },
        }],
      }
    : null;

  const columns = [
    { title: 'S.No', dataIndex: 'serialNumber', width: 70 },
    { title: 'Customer', dataIndex: ['customer', 'name'], width: 120 },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    {
      title: 'Stage',
      dataIndex: ['dealStage', 'code'],
      width: 90,
      render: (v: string) => {
        const colors: Record<string, string> = {
          SECURED: '#065f46', 'O(L)': '#7f1d1d', 'O(H)': '#4c1d95',
          A: '#374151', B: '#1e3a8a', C: '#0f4c5c', D: '#92400e', E: '#7c2d12', F: '#14532d',
        };
        return <Tag color={colors[v] || '#374151'}>{v}</Tag>;
      },
    },
    {
      title: 'TCV (USD M)',
      dataIndex: 'tcvUsdMillion',
      width: 110,
      render: (v: number) => <strong>{fmtTcv(v)}</strong>,
    },
  ];

  const staleColumns = [
    {
      title: '',
      dataIndex: 'daysSinceActivity',
      width: 56,
      render: (days: number) => {
        const { color, label } = staleBand(days);
        return (
          <Tooltip title={`No progress for ${days} day${days !== 1 ? 's' : ''}`}>
            <Tag style={{ backgroundColor: color, color: '#fff', border: 'none', fontWeight: 600, minWidth: 40, textAlign: 'center' }}>
              {label}
            </Tag>
          </Tooltip>
        );
      },
    },
    { title: 'S.No', dataIndex: 'serialNumber', width: 64 },
    { title: 'Customer', dataIndex: 'customerName', width: 120 },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    {
      title: 'Stage',
      dataIndex: 'stageCode',
      width: 80,
      render: (v: string) => {
        const colors: Record<string, string> = {
          A: '#374151', B: '#1e3a8a', C: '#0f4c5c', D: '#92400e', E: '#7c2d12', F: '#14532d',
        };
        return <Tag color={colors[v] || '#374151'}>{v}</Tag>;
      },
    },
    { title: 'Confidence', dataIndex: 'confidenceName', width: 100 },
    {
      title: 'TCV (USD M)',
      dataIndex: 'tcvUsdMillion',
      width: 110,
      render: (v: number) => <strong>{fmtTcv(v)}</strong>,
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivityDate',
      width: 110,
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
  ];

  if (summLoading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Opportunities"
              value={summary?.totalOpportunities ?? 0}
              prefix={<FundOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pipeline TCV"
              value={summary ? fmtTcv(summary.totalPipelineTcv) : '-'}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Secured TCV"
              value={summary ? fmtTcv(summary.securedTcv) : '-'}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Win Rate"
              value={summary?.winRate?.toFixed(1) ?? 0}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="TCV by Business Unit" size="small">
            {buChartOption ? (
              <ReactECharts option={buChartOption} style={{ height: 240 }} />
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                No data
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="TCV by Stage" size="small">
            {stageChartOption ? (
              <ReactECharts option={stageChartOption} style={{ height: 240 }} />
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                No data
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <span>
            <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            Needs Attention
            {stale.length > 0 && (
              <Badge count={stale.length} style={{ marginLeft: 8, backgroundColor: '#fa8c16' }} />
            )}
          </span>
        }
        extra={
          <span style={{ fontSize: 12, color: '#888' }}>
            No progress in the last 7+ days &nbsp;|&nbsp;
            <Tag style={{ backgroundColor: '#faad14', color: '#fff', border: 'none' }}>7–14d</Tag>
            <Tag style={{ backgroundColor: '#fa8c16', color: '#fff', border: 'none' }}>15–30d</Tag>
            <Tag style={{ backgroundColor: '#f5222d', color: '#fff', border: 'none' }}>31–60d</Tag>
            <Tag style={{ backgroundColor: '#820014', color: '#fff', border: 'none' }}>61d+</Tag>
          </span>
        }
      >
        {stale.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#52c41a' }}>
            All opportunities have had recent activity
          </div>
        ) : (
          <Table
            dataSource={stale}
            columns={staleColumns}
            rowKey="id"
            pagination={{ pageSize: 10, size: 'small', showSizeChanger: false }}
            size="small"
            rowClassName={(record) => {
              const days: number = record.daysSinceActivity;
              if (days >= 61) return 'stale-critical';
              if (days >= 31) return 'stale-high';
              if (days >= 15) return 'stale-medium';
              return 'stale-low';
            }}
          />
        )}
      </Card>

      <Card title="Recent Opportunities" size="small">
        <Table
          dataSource={recent as any[]}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
