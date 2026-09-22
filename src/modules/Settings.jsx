import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Gauge,
  CheckCircle2,
  Moon,
  Sun,
  ShieldCheck,
  Save,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SettingsModule({ userProfile, onUpdateProfile, darkMode, setDarkMode }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [formData, setFormData] = useState({ ...userProfile, language: 'en' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const errs = {};
    if (activeSubTab === 'profile') {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.email.trim()) {
        errs.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errs.email = 'Please provide a valid email format';
      }

      // Password validation (if user typed in any password field)
      if (passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) {
        if (!passwordData.currentPassword) {
          errs.currentPassword = 'Enter current password to set a new one';
        }
        if (!passwordData.newPassword) {
          errs.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
          errs.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordData.confirmPassword) {
          errs.confirmPassword = 'Confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
          errs.confirmPassword = 'Passwords do not match';
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile({
        ...formData,
        ...(passwordData.newPassword ? { passwordUpdated: true } : {})
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSaving(false);
    }, 600); // simulated networking latency
  };

  return (
    <div className="space-y-6 text-sm max-w-4xl">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your personal preferences, fleet warning limits, and telemetry settings.</p>
      </div>

      {/* Settings Layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="p-2.5 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-row md:flex-col gap-1 w-full overflow-x-auto">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'telematics', label: 'Fleet Triggers', icon: Gauge },
            { id: 'notifications', label: 'Alert Preferences', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all text-left ${
                  activeSubTab === tab.id
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/15'
                    : 'text-slate-505 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:col-span-3 space-y-6">
          
          {/* 1. Profile section */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm tracking-tight mb-1">User Profile</h3>
                <p className="text-xs text-slate-400">Update your account credentials and personal avatar portrait</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 py-2">
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow"
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-80 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Role / Position</label>
                  <input
                    type="text"
                    disabled
                    value={formData.role}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border dark:border-slate-800 text-slate-400 focus:outline-none rounded-xl cursor-not-allowed text-sm"
                  />
                </div>

                {/* Dark Mode toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">App Theme Mode</label>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full px-3.5 py-2.5 border dark:border-slate-800 rounded-xl font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <span className="flex items-center gap-1.5">
                      {darkMode ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      {darkMode ? 'Dark Theme' : 'Light Theme'}
                    </span>
                    <span className="text-[10px] text-sky-500">Toggle</span>
                  </button>
                </div>

                {/* Language Select */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Preferred Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
                  >
                    <option value="en">English (Default)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                  </select>
                </div>

                {/* Account Security & Password Section */}
                <div className="col-span-2 pt-4 border-t dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Account Password & Security
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Leave password fields empty if you only wish to update profile details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                          className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm transition-all focus:ring-2 focus:ring-sky-500/20 ${
                            errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-[11px] text-red-500 font-semibold">{errors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Min. 6 characters"
                          className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm transition-all focus:ring-2 focus:ring-sky-500/20 ${
                            errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-[11px] text-red-500 font-semibold">{errors.newPassword}</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm transition-all focus:ring-2 focus:ring-sky-500/20 ${
                            errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] text-red-500 font-semibold">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Telematics parameters */}
          {activeSubTab === 'telematics' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm tracking-tight mb-1">Fleet Telematics Triggers</h3>
                <p className="text-xs text-slate-400">Configure parameters used to trigger Traccar telemetry warnings</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Overspeed Threshold (km/h)"
                    type="number"
                    value={formData.speedThreshold}
                    onChange={(e) => setFormData({ ...formData, speedThreshold: parseInt(e.target.value) || 80 })}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Speeds above this value generate warning alerts.</span>
                </div>
                <div>
                  <Input
                    label="Idle Time Limit (Minutes)"
                    type="number"
                    value={formData.idleAlertMinutes}
                    onChange={(e) => setFormData({ ...formData, idleAlertMinutes: parseInt(e.target.value) || 15 })}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum idle duration before dispatch flags.</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Notifications */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm tracking-tight mb-1">Notification Delivery Channels</h3>
                <p className="text-xs text-slate-400">Configure alerts channels for critical overspeed triggers and expirations</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receivePushNotifications}
                    onChange={(e) => setFormData({ ...formData, receivePushNotifications: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">Browser Push Notifications</span>
                    <span className="text-[10px] text-slate-400 leading-normal">Send immediate alert overlays on geofence/overspeed breaches.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receiveEmailNotifications}
                    onChange={(e) => setFormData({ ...formData, receiveEmailNotifications: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">Email Digest Notifications</span>
                    <span className="text-[10px] text-slate-400 leading-normal">Send summary reports on insurance policy dates and maintenance schedules.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t dark:border-slate-800 flex justify-end">
            <Button
              type="submit"
              loading={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preference Configuration
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
