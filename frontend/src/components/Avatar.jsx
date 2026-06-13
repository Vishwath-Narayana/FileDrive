const Avatar = ({
  initials,
  avatarUrl,
  alt = '',
  size = 28,
  fontSize = 11,
  fontWeight = 600,
  background = 'var(--bg-card)',
  color = 'var(--text-tertiary)',
  style,
}) => (
  <div
    style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${fontSize}px`, fontWeight,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.02em',
      overflow: 'hidden', flexShrink: 0,
      border: '1px solid var(--border-subtle)',
      ...style,
    }}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials}
  </div>
);

export default Avatar;
