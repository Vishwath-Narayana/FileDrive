const RoleBadge = ({ role }) => {
  let bg = '#FFFFFF';
  let color = '#6B7280';
  let border = '#E5E7EB';

  if (role === 'admin') {
    bg = '#EFF6FF'; color = '#2563EB'; border = '#BFDBFE';
  } else if (role === 'editor') {
    bg = '#FFFBEB'; color = '#D97706'; border = '#FDE68A';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 500,
      padding: '4px 10px',
      borderRadius: '6px',
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      whiteSpace: 'nowrap'
    }}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

export default RoleBadge;
