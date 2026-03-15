import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tab, Tabs } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const avatarOptions = [
    '😀', '😎', '🚀', '💼', '🎨', '🎯', '⚡', '🔥',
    '🌟', '💡', '🎭', '🎪', '🎬', '🎮', '🎲', '🎸'
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSavingProfile(true);
      await api.put('/users/profile', { name, avatar });
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab="settings" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onOpenAdminModal={() => {}} 
          onOpenCreateOrgModal={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="border-b border-gray-200"
              >
                <Tab
                  eventKey="profile"
                  title={
                    <span className="flex items-center gap-2 px-4 py-3">
                      <User size={18} />
                      Profile
                    </span>
                  }
                >
                  <div className="p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Profile Avatar
                        </label>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl border-2 border-gray-200">
                            {avatar || user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Choose an emoji avatar</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                          {avatarOptions.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setAvatar(emoji)}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                                avatar === emoji
                                  ? 'bg-gray-900 ring-2 ring-gray-900 ring-offset-2'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setAvatar('')}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                              !avatar
                                ? 'bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            <User size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={user?.email}
                          disabled
                          className="input-field bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="btn-primary disabled:opacity-50"
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </Tab>

                <Tab
                  eventKey="security"
                  title={
                    <span className="flex items-center gap-2 px-4 py-3">
                      <Lock size={18} />
                      Security
                    </span>
                  }
                >
                  <div className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Ensure your account is using a strong password to stay secure.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-field"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="btn-primary disabled:opacity-50"
                        >
                          {changingPassword ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Forgot Password?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        If you've forgotten your password, you can request a password reset via email.
                      </p>
                      <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-gray-900 font-medium hover:underline"
                      >
                        Reset Password via Email →
                      </button>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
