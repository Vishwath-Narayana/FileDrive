import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateAvatar, updatePassword } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || '');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `http://localhost:5001${user.avatar}` : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const passwordStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#22C55E'];

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setAvatarFile(file);

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateAvatar(response.data.avatar);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSavingProfile(true);
      await api.put('/users/profile', { name, age: age ? Number(age) : null });
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const sectionCard = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
    margin: '0 0 16px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
    marginBottom: '6px',
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
    <style>{`
      .settings-main-offset { margin-left: 200px; }
      .settings-content { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
      .settings-name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .settings-passwords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 767px) {
        .settings-main-offset { margin-left: 0 !important; }
        .settings-content { padding: 20px 16px; }
      }
      @media (max-width: 640px) {
        .settings-name-grid { grid-template-columns: 1fr; }
        .settings-passwords-grid { grid-template-columns: 1fr; }
      }
    `}</style>
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar activeTab="settings" setActiveTab={() => {}} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      
      <div className="settings-main-offset" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar 
          onOpenAdminModal={() => {}} 
          onOpenCreateOrgModal={() => {}}
          setDrawerOpen={setDrawerOpen}
        />
        
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          <div className="settings-content">
            {/* Back + heading */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', color: 'var(--text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  marginBottom: '16px',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft size={14} strokeWidth={2} />
                Back to dashboard
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Account settings
              </h1>
            </div>

            {/* Profile section */}
            <div style={sectionCard}>
              <p style={sectionTitle}>Profile</p>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Avatar */}
                <div>
                  <label style={{ ...labelStyle }}>Your avatar</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: '52px', height: '52px', borderRadius: '50%',
                          background: '#E8E8E6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)',
                          overflow: 'hidden',
                        }}
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                      </div>
                      {uploadingAvatar && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.45)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        style={{
                          fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)',
                          cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent',
                          transition: 'text-decoration-color 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecorationColor = 'var(--text-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                        Square PNG or JPG · Max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name + Age */}
                <div className="settings-name-grid">
                  <div>
                    <label htmlFor="name" style={labelStyle}>Full name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="age" style={labelStyle}>Age (optional)</label>
                    <input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 25"
                      min="0"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={labelStyle}>Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    className="input-field"
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                    Email is managed by your authentication provider
                  </p>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button type="submit" disabled={savingProfile} className="btn-primary">
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security section */}
            <div style={sectionCard}>
              <p style={sectionTitle}>Security</p>

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="settings-passwords-grid">
                  {/* New password */}
                  <div>
                    <label style={labelStyle}>New password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                        }}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              style={{
                                height: '3px', flex: 1, borderRadius: '2px',
                                background: i <= passwordStrength ? strengthColors[passwordStrength] : 'var(--border)',
                                transition: 'background 200ms ease',
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: '11px', color: strengthColors[passwordStrength], margin: '3px 0 0', fontWeight: 500 }}>
                          {strengthLabels[passwordStrength]}
                        </p>
                      </div>
                    )}
                    {!newPassword && (
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Minimum 6 characters</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        style={{
                          paddingRight: '40px',
                          borderColor: confirmPassword && confirmPassword !== newPassword
                            ? '#EF4444'
                            : confirmPassword && confirmPassword === newPassword
                            ? '#22C55E'
                            : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p style={{ fontSize: '11px', color: '#EF4444', margin: '4px 0 0' }}>Passwords do not match</p>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                      <p style={{ fontSize: '11px', color: '#22C55E', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} /> Passwords match
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="submit"
                    disabled={updatingPassword || !newPassword || !confirmPassword}
                    style={{
                      height: '32px', padding: '0 14px',
                      background: (!newPassword || !confirmPassword) ? '#E8E8E6' : '#1A1A1A',
                      color: (!newPassword || !confirmPassword) ? '#9CA3AF' : '#FFFFFF',
                      border: 'none', borderRadius: '6px',
                      fontSize: '13px', fontWeight: 500,
                      cursor: (updatingPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                      pointerEvents: (!newPassword || !confirmPassword) ? 'none' : 'auto',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'background 150ms ease, color 150ms ease',
                    }}
                  >
                    {updatingPassword ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        Updating...
                      </span>
                    ) : 'Change password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </>
  );
};

export default Settings;
