export function formatDateTime(value: string | Date): string {
  const d = new Date(value);
  return d.toLocaleString('en-IN', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function formatDate(value: string | Date): string {
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
