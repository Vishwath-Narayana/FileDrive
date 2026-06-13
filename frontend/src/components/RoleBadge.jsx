const RoleBadge = ({ role }) => {
  let bg = 'var(--bg-hover)';
  let color = 'var(--text-tertiary)';
  let border = 'var(--border)';

  if (role === 'admin') {
    bg = 'var(--accent-indigo-soft)'; color = 'var(--accent-indigo-hover)'; border = 'rgba(255, 107, 0, 0.25)';
  } else if (role === 'editor') {
    bg = 'var(--accent-amber-soft)'; color = 'var(--accent-amber)'; border = 'rgba(245,158,11,0.25)';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '10px',
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: '4px',
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}>
      {role}
    </span>
  );
};

export default RoleBadge;
