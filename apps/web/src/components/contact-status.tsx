export type ContactStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';

export function ContactStatusBadge({ value }: { value: ContactStatus }) {
  const colors = {
    PENDING: 'bg-amber-400/10 text-amber-200',
    PROCESSING: 'bg-blue-400/10 text-blue-200',
    DELIVERED: 'bg-emerald-400/10 text-emerald-200',
    FAILED: 'bg-red-400/10 text-red-200',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[value]}`}>
      {value.toLowerCase()}
    </span>
  );
}
