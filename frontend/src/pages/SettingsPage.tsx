import { User, Bell, Palette } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="animate-slide-up max-w-3xl">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">Settings</h1>
      <p className="text-sm text-surface-500 mb-8">Manage your account and workspace preferences.</p>

      {/* Profile Section */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-primary-600" />
          <h2 className="text-base font-semibold text-surface-900">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Full name</label>
            <input type="text" defaultValue={user?.name || ''} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
            <input type="email" defaultValue={user?.email || ''} className="input" disabled />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary text-sm">Save Changes</button>
        </div>
      </section>

      {/* Notifications */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Bell size={18} className="text-primary-600" />
          <h2 className="text-base font-semibold text-surface-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {['Layout sync status', 'Asset upload complete', 'Collaboration invites'].map((item) => (
            <label key={item} className="flex items-center justify-between">
              <span className="text-sm text-surface-700">{item}</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <Palette size={18} className="text-primary-600" />
          <h2 className="text-base font-semibold text-surface-900">Appearance</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Theme</label>
          <select className="input w-48">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </section>
    </div>
  );
}
