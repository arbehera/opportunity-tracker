import { Timeline, Typography, Empty, Spin, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useOpportunityHistory } from '../../hooks/useOpportunities';
import { formatDateTime } from '../../utils/formatters';

const FIELD_LABELS: Record<string, string> = {
  customerId: 'Customer', description: 'Description', businessUnitId: 'Business Unit',
  productCategoryId: 'Product Category', productSubcategoryId: 'Subcategory',
  businessCategoryId: 'Business Category', pinSalesId: 'Sales', pinPresalesId: 'Presales',
  dealStageId: 'Deal Stage', confidenceLevelId: 'Confidence Level',
  estimatedClosureDate: 'Closure Date', lifetimeVolume: 'Lifetime Volume',
  unitPriceInr: 'Unit Price (INR)', unitPriceUsd: 'Unit Price (USD)',
  comments: 'Comments', pms: 'PMS', remarks: 'Remarks',
};

export default function OpportunityHistory({ opportunityId }: { opportunityId: string }) {
  const { data, isLoading } = useOpportunityHistory(opportunityId);

  if (isLoading) return <Spin />;
  if (!data?.data?.length) return <Empty description="No change history yet" />;

  const items = data.data.map((h: any) => ({
    dot: <ClockCircleOutlined />,
    color: 'blue',
    children: (
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <Tag>{FIELD_LABELS[h.fieldName] || h.fieldName}</Tag>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatDateTime(h.changedAt)} · {h.changedBy?.fullName}
          </Typography.Text>
        </div>
        <div style={{ fontSize: 13 }}>
          <Typography.Text delete type="danger">{h.oldValue || '(empty)'}</Typography.Text>
          {' → '}
          <Typography.Text strong type="success">{h.newValue || '(empty)'}</Typography.Text>
        </div>
        {h.changeNote && <Typography.Text type="secondary" italic style={{ fontSize: 12 }}>{h.changeNote}</Typography.Text>}
      </div>
    ),
  }));

  return <Timeline items={items} />;
}
