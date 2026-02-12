import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'accepted';
  className?: string;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
  approved: { label: 'Approved', className: 'bg-success/15 text-success border-success/30' },
  accepted: { label: 'Accepted', className: 'bg-success/15 text-success border-success/30' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  );
}
