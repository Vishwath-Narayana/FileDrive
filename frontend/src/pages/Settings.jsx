import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowLeft, Camera, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tab, Tabs } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateAvatar } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || '');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `http://localhost:5001${user.avatar}` : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');

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
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setAvatarFile(file);

    // Upload immediately
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
      await api.put('/users/profile', { name, age: age ? Number(age) : null, email });
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
    
    if (showOTPInput) {
      if (!otpCode || !newPassword || !confirmPassword) {
        toast.error('All fields are required for OTP reset');
        return;
      }
    } else {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('All fields are required');
        return;
      }
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
      
      if (showOTPInput) {
        // use OTP verification route
        await api.post('/users/reset-password', { 
          email: user.email, 
          otp: otpCode, 
          newPassword 
        });
      } else {
        // use standard change password route
        await api.put('/users/change-password', { currentPassword, newPassword });
      }
      
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setShowOTPInput(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestOTP = async () => {
    try {
      setSendingOTP(true);
      await api.post('/users/request-password-reset', { email: user.email });
      toast.success('OTP sent to your email! (Check spam)');
      setShowOTPInput(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
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
                          Profile Photo
                        </label>
                        <div className="flex items-center gap-5">
                          {/* Avatar preview */}
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                              {avatarPreview ? (
                                <img
                                  src={avatarPreview}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl font-semibold text-gray-500">
                                  {user?.name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {uploadingAvatar && (
                              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Upload button */}
                          <div>
                            <label
                              htmlFor="avatar-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Camera size={16} className="text-gray-500" />
                              {uploadingAvatar ? 'Uploading...' : 'Upload photo'}
                            </label>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                              disabled={uploadingAvatar}
                            />
                            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF · Max 5MB</p>
                          </div>
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="input-field"
                          placeholder="Your age"
                          min="0"
                        />
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

                      {!showOTPInput ? (
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                            <span>Current Password</span>
                            <button 
                              type="button" 
                              onClick={handleRequestOTP}
                              disabled={sendingOTP}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {sendingOTP ? 'Sending OTP...' : 'Forgot password?'}
                            </button>
                          </label>
                          <div className="relative">
                            <input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="input-field pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                            <span>Verification OTP</span>
                            <button 
                              type="button" 
                              onClick={() => setShowOTPInput(false)}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Remembered it?
                            </button>
                          </label>
                          <input
                            id="otp"
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="input-field"
                            placeholder="Enter 6-digit OTP code"
                            maxLength={6}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            We've sent an OTP to {user?.email}. It may take a minute to arrive.
                          </p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
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
