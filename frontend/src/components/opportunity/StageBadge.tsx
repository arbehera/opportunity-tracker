import { Tag } from 'antd';

const STAGE_COLORS: Record<string, string> = {
  'A': '#374151',
  'B': '#1e3a8a',
  'C': '#0f4c5c',
  'D': '#92400e',
  'E': '#7c2d12',
  'F': '#14532d',
  'SECURED': '#065f46',
  'O(H)': '#4c1d95',
  'O(L)': '#7f1d1d',
};

interface Props { code: string; label?: string; }

export default function StageBadge({ code, label }: Props) {
  return <Tag color={STAGE_COLORS[code] || '#374151'}>{label || code}</Tag>;
}
