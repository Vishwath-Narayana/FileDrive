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
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar activeTab="settings" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onOpenAdminModal={() => {}} 
          onOpenCreateOrgModal={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 transition-colors text-sm font-medium border-none bg-transparent p-0 focus:outline-none"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">Settings</h1>
              <p className="text-sm text-gray-500">Manage your profile and account preferences</p>
            </div>

            <div className="card-premium overflow-hidden bg-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="premium-tabs border-b border-[#EDEDED] px-6 pt-2"
              >
                <Tab
                  eventKey="profile"
                  title={
                    <span className="flex items-center gap-2 px-2 py-4 text-sm font-bold">
                      <User size={16} />
                      Profile
                    </span>
                  }
                >
                  <div className="p-10">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                          Your Avatar
                        </label>
                        <div className="flex items-center gap-8">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-[#EDEDED] p-1 overflow-hidden transition-all group-hover:border-black">
                              <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                                {avatarPreview ? (
                                  <img
                                    src={avatarPreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  user?.name?.charAt(0).toUpperCase()
                                )}
                              </div>
                            </div>
                            {uploadingAvatar && (
                              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="avatar-upload"
                              className="btn-secondary py-2 text-xs"
                            >
                              <Camera size={14} />
                              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                            </label>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                              disabled={uploadingAvatar}
                            />
                            <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-tighter">Square PNG or JPG • Max 5MB</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label htmlFor="name" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Full Name
                          </label>
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
                          <label htmlFor="age" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Age (Optional)
                          </label>
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

                      <div>
                        <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
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

                      <div className="flex gap-4 pt-4 border-t border-[#FAFAFA]">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="btn-primary"
                        >
                          {savingProfile ? 'Saving...' : 'Update Details'}
                        </button>
                      </div>
                    </form>
                  </div>
                </Tab>

                <Tab
                  eventKey="security"
                  title={
                    <span className="flex items-center gap-2 px-2 py-4 text-sm font-bold">
                      <Lock size={16} />
                      Security
                    </span>
                  }
                >
                  <div className="p-10">
                    <form onSubmit={handleChangePassword} className="space-y-8">
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-black mb-1">Protected Workspace</h3>
                        <p className="text-xs text-gray-500">Update your password to keep your folders secure.</p>
                      </div>

                      <div className="max-w-md space-y-6">
                        {!showOTPInput ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="current-password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Current Password
                              </label>
                              <button 
                                type="button" 
                                onClick={handleRequestOTP}
                                disabled={sendingOTP}
                                className="text-[12px] font-bold text-gray-400 hover:text-black hover:underline underline-offset-2 border-none bg-transparent p-0 focus:outline-none transition-colors"
                              >
                                {sendingOTP ? 'Sending OTP...' : 'Lost access? Reset via OTP'}
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-field pr-12"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                              >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-6 rounded-[16px] border border-[#EDEDED] animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor="otp" className="block text-[11px] font-bold text-black uppercase tracking-wider">
                                Verify Reset code (OTP)
                              </label>
                              <button 
                                type="button" 
                                onClick={() => setShowOTPInput(false)}
                                className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors"
                              >
                                Back
                              </button>
                            </div>
                            <input
                              id="otp"
                              type="text"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="input-field bg-white text-center text-lg font-bold tracking-widest"
                              placeholder="000000"
                              maxLength={6}
                            />
                            <p className="mt-3 text-[10px] font-medium text-gray-400 leading-relaxed uppercase">
                              We've sent a 6-digit code to your inbox. Please check your spam folder.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="new-password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pr-12"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="confirm-password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Confirm
                            </label>
                            <div className="relative">
                              <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pr-12"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#FAFAFA]">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="btn-primary"
                        >
                          {changingPassword ? 'Verifying...' : 'Secure Account'}
                        </button>
                      </div>
                    </form>
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
