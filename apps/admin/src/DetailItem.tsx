export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          background: '#f7f7f7',
          padding: 8,
          borderRadius: 6,
          wordBreak: 'break-all',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}
