import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Eye, EyeOff, ShieldCheck, User, Lock } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('profile');

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
  const strengthColors = ['', 'var(--accent-red)', 'var(--accent-amber)', 'var(--accent-green)'];

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

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px', fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-tertiary)',
    marginBottom: '8px',
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <>
    <style>{`
      .settings-main-offset { margin-left: 224px; }
      .settings-shell { display: flex; gap: 32px; max-width: 980px; margin: 0 auto; padding: 32px 28px 64px; align-items: flex-start; }
      .settings-nav { width: 220px; flex-shrink: 0; position: sticky; top: 32px; }
      .settings-panels { flex: 1; min-width: 0; max-width: 620px; }
      .settings-name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .settings-passwords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .settings-nav-item {
        display: flex; align-items: center; gap: 10px;
        height: 36px; padding: 0 12px; margin-bottom: 2px;
        border-radius: 8px; font-size: 13px; font-weight: 500;
        cursor: pointer; border: none; background: transparent;
        width: 100%; text-align: left; color: var(--text-tertiary);
        transition: background 120ms ease, color 120ms ease;
      }
      .settings-nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
      .settings-nav-item-active {
        background: var(--accent-indigo-soft); color: var(--accent-indigo-hover);
        box-shadow: inset 3px 0 0 0 var(--accent-indigo);
      }
      @media (max-width: 900px) {
        .settings-shell { flex-direction: column; gap: 16px; padding: 24px 16px 48px; }
        .settings-nav { width: 100%; position: static; }
        .settings-panels { max-width: 100%; }
      }
      @media (max-width: 767px) {
        .settings-main-offset { margin-left: 0 !important; }
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
          <div className="settings-shell">
            {/* Left — settings navigation */}
            <aside className="settings-nav">
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  marginBottom: '20px',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <ArrowLeft size={14} strokeWidth={2} />
                BACK
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Settings
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-quaternary)', margin: '0 0 20px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                MANAGE YOUR ACCOUNT
              </p>
              <nav>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`settings-nav-item ${isActive ? 'settings-nav-item-active' : ''}`}
                    >
                      <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right — settings content */}
            <div className="settings-panels">
              {/* Profile section */}
              <div id="profile-section" className="cc-surface" style={{ borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <User size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Profile</span>
                </div>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Avatar */}
                  <div>
                    <label style={labelStyle}>AVATAR</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 600, color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
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
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          </div>
                        )}
                        <label
                          htmlFor="avatar-upload"
                          style={{
                            position: 'absolute', bottom: '-2px', right: '-2px',
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'var(--accent-indigo)', border: '2px solid var(--bg-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Camera size={10} style={{ color: '#FFFFFF' }} />
                        </label>
                      </div>
                      <div>
                        <label
                          htmlFor="avatar-upload"
                          style={{
                            fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'color 150ms ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
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
                        <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', margin: '3px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                          PNG / JPG · MAX 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name + Age */}
                  <div className="settings-name-grid">
                    <div>
                      <label htmlFor="name" style={labelStyle}>FULL NAME</label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field-dark"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="age" style={labelStyle}>AGE</label>
                      <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="input-field-dark"
                        placeholder="e.g. 25"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" style={labelStyle}>EMAIL ADDRESS</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      className="input-field-dark"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', margin: '4px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                      MANAGED BY AUTH PROVIDER
                    </p>
                  </div>

                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <button type="submit" disabled={savingProfile} className="btn-primary-indigo">
                      {savingProfile ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security section */}
              <div id="security-section" className="cc-surface" style={{ borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Security</span>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="settings-passwords-grid">
                    {/* New password */}
                    <div>
                      <label style={labelStyle}>NEW PASSWORD</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field-dark"
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
                            color: 'var(--text-quaternary)', display: 'flex', alignItems: 'center',
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
                          <p style={{ fontSize: '10px', color: strengthColors[passwordStrength], margin: '3px 0 0', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                            {strengthLabels[passwordStrength].toUpperCase()}
                          </p>
                        </div>
                      )}
                      {!newPassword && (
                        <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', margin: '4px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>MIN 6 CHARACTERS</p>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label style={labelStyle}>CONFIRM PASSWORD</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-field-dark"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          style={{
                            paddingRight: '40px',
                            borderColor: confirmPassword && confirmPassword !== newPassword
                              ? 'var(--accent-red)'
                              : confirmPassword && confirmPassword === newPassword
                              ? 'var(--accent-green)'
                              : undefined,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            color: 'var(--text-quaternary)', display: 'flex', alignItems: 'center',
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p style={{ fontSize: '10px', color: 'var(--accent-red)', margin: '4px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>PASSWORDS DO NOT MATCH</p>
                      )}
                      {confirmPassword && confirmPassword === newPassword && (
                        <p style={{ fontSize: '10px', color: 'var(--accent-green)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                          <ShieldCheck size={11} /> MATCH
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="submit"
                      disabled={updatingPassword || !newPassword || !confirmPassword}
                      className="btn-primary-indigo"
                      style={{
                        opacity: (!newPassword || !confirmPassword) ? 0.4 : 1,
                        cursor: (updatingPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                        pointerEvents: (!newPassword || !confirmPassword) ? 'none' : 'auto',
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
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default Settings;
