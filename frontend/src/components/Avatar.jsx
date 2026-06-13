const Avatar = ({
  initials,
  avatarUrl,
  alt = '',
  size = 28,
  fontSize = 11,
  fontWeight = 500,
  background = '#E8E8E6',
  color = 'var(--text-secondary)',
  style,
}) => (
  <div
    style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${fontSize}px`, fontWeight,
      overflow: 'hidden', flexShrink: 0,
      ...style,
    }}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials}
  </div>
);

export default Avatar;
