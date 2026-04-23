import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Typography, Timeline, Spin,
  Divider, Row, Col, Statistic,
} from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getOpportunity, getOpportunityHistory } from '@/api/opportunities';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

const stageColors: Record<string, string> = {
  SECURED: '#065f46', 'O(L)': '#7f1d1d', 'O(H)': '#4c1d95',
  A: '#374151', B: '#1e3a8a', C: '#0f4c5c', D: '#92400e', E: '#7c2d12', F: '#14532d',
};

const confColors: Record<string, string> = {
  High: '#065f46', Mid: '#78350f', Low: '#9a3412', Secured: '#0f4c5c', Lost: '#7f1d1d',
};

const fieldLabels: Record<string, string> = {
  customerId: 'Customer', description: 'Description', businessUnitId: 'Business Unit',
  productCategoryId: 'Category', productSubcategoryId: 'Subcategory',
  businessCategoryId: 'Biz Category', pinSalesId: 'PIN Sales', pinPresalesId: 'PIN Presales',
  dealStageId: 'Stage', confidenceLevelId: 'Confidence', estimatedClosureDate: 'Closure Date',
  lifetimeVolume: 'Lifetime Volume', unitPriceInr: 'Unit Price INR', unitPriceUsd: 'Unit Price USD',
  tcvUsdMillion: 'TCV USD M', comments: 'Comments', pms: 'PMS', remarks: 'Remarks',
};

// Detect and format date-like strings; return other values as-is
function fmtHistoryVal(val: string | null | undefined): string {
  if (!val) return '-';
  const looksLikeDate =
    /^\d{4}-\d{2}-\d{2}/.test(val) ||
    /^[A-Z][a-z]{2}\s[A-Z][a-z]{2}/.test(val) ||
    val.includes('GMT');
  if (looksLikeDate) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
  return val;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: oppRes, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => getOpportunity(id!),
  });
  const { data: historyRes } = useQuery({
    queryKey: ['opportunity', id, 'history'],
    queryFn: () => getOpportunityHistory(id!),
  });

  if (isLoading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const opp = oppRes?.data?.data as any;
  const history = historyRes?.data?.data || [];
  const canEdit = ['ADMIN', 'MANAGER', 'SALES'].includes(user?.role || '');

  if (!opp) return <Text type="danger">Opportunity not found</Text>;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/opportunities')}>Back</Button>
          <Title level={4} style={{ margin: 0 }}>
            Opportunity #{opp.serialNumber}
          </Title>
        </Space>
        {canEdit && (
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/opportunities/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Opportunity Details" size="small">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Customer">{opp.customer?.name}</Descriptions.Item>
              <Descriptions.Item label="Business Unit">{opp.businessUnit?.name}</Descriptions.Item>
              <Descriptions.Item label="Category">{opp.productCategory?.name}</Descriptions.Item>
              <Descriptions.Item label="Subcategory">{opp.productSubcategory?.name}</Descriptions.Item>
              <Descriptions.Item label="Biz Category">{opp.businessCategory?.name}</Descriptions.Item>
              <Descriptions.Item label="Stage">
                <Tag color={stageColors[opp.dealStage?.code] || '#374151'}>{opp.dealStage?.code}</Tag>
                {' '}{opp.dealStage?.status}
              </Descriptions.Item>
              <Descriptions.Item label="Confidence">
                <Tag color={confColors[opp.confidenceLevel?.name] || '#374151'}>{opp.confidenceLevel?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Est. Closure">
                {opp.estimatedClosureDate ? new Date(opp.estimatedClosureDate).toLocaleDateString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="PIN Sales">{opp.pinSales?.fullName}</Descriptions.Item>
              <Descriptions.Item label="PIN Presales">{opp.pinPresales?.fullName || '-'}</Descriptions.Item>
              <Descriptions.Item label="PMS">{opp.pms || '-'}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{opp.description}</Descriptions.Item>
              <Descriptions.Item label="Comments" span={2}>{opp.comments || '-'}</Descriptions.Item>
              <Descriptions.Item label="Remarks" span={2}>{opp.remarks || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Financials" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic title="TCV (USD M)" value={`$${Number(opp.tcvUsdMillion).toFixed(2)}M`} valueStyle={{ color: '#1677ff' }} />
              </Col>
              <Col span={12}>
                <Statistic title="Unit Price INR" value={`₹${Number(opp.unitPriceInr).toFixed(2)}`} />
              </Col>
              <Col span={12}>
                <Statistic title="Unit Price USD" value={`$${Number(opp.unitPriceUsd).toFixed(4)}`} />
              </Col>
              <Col span={24}>
                <Statistic title="Lifetime Volume" value={Number(opp.lifetimeVolume).toLocaleString()} suffix="units" />
              </Col>
              <Col span={24}>
                <Statistic title="Winning Probability" value={`${Number(opp.dealStage?.winningProbability).toFixed(0)}%`} />
              </Col>
            </Row>
          </Card>

          <Card title="Meta" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Created By">{opp.createdBy?.fullName}</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(opp.createdAt).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{new Date(opp.updatedAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title={`Change History (${history.length})`} size="small">
        {history.length === 0 ? (
          <Text type="secondary">No changes recorded yet.</Text>
        ) : (
          <Timeline
            items={history.map((h: any) => ({
              children: (
                <div>
                  <Text strong>{h.changedBy?.fullName}</Text>{' '}
                  <Text type="secondary">changed</Text>{' '}
                  <Text code>{fieldLabels[h.fieldName] || h.fieldName}</Text>
                  {h.oldValue && (
                    <> from <Text delete type="danger">{fmtHistoryVal(h.oldValue)}</Text></>
                  )}
                  {h.newValue && (
                    <> to <Text mark>{fmtHistoryVal(h.newValue)}</Text></>
                  )}
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{fmtDateTime(h.changedAt)}</div>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
