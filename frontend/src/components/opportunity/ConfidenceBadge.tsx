import { Tag } from 'antd';

const CONF_COLORS: Record<string, string> = {
  'High': '#065f46',
  'Mid': '#78350f',
  'Low': '#9a3412',
  'Secured': '#0f4c5c',
  'Lost': '#7f1d1d',
};

interface Props { name: string; }

export default function ConfidenceBadge({ name }: Props) {
  return <Tag color={CONF_COLORS[name] || '#374151'}>{name}</Tag>;
}
