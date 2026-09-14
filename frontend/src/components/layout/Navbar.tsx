import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Menu, CheckCircle2, Sparkles, UploadCloud,
  Settings, LogOut, ShieldCheck, Layers, X, Check,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/editor': 'Layouts / Editor',
  '/preview': 'Multi-Surface Preview',
  '/assets': 'Assets Library',
  '/surfaces': 'Surfaces',
  '/settings': 'Settings',
  '/admin': 'Admin',
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'asset';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Adaptive Matrix Synced',
    description: 'AcousticPro Audio rendered across all 5 surfaces with zero layout clipping.',
    time: '2m ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Pre-flight Validation Pass',
    description: 'Contrast ratio AA check passed (100%) for Nike Air Max Launch campaign.',
    time: '18m ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n3',
    title: 'New Vector Asset Uploaded',
    description: 'AdaptFlow-Mark-Dark.svg added to primary brand asset collection.',
    time: '1h ago',
    read: false,
    type: 'asset',
  },
];

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentLabel = Object.entries(ROUTE_LABELS).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'AdaptFlow';

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSignOut = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: Mobile menu toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-surface-500 hidden sm:inline">Campaigns</span>
          <span className="text-surface-300 hidden sm:inline">›</span>
          <span className="font-medium text-surface-900">{currentLabel}</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search layouts, surfaces, tokens..."
            className="input pl-9 pr-16 py-1.5 bg-surface-50 border-surface-200 text-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-surface-200 rounded text-[10px] font-medium text-surface-500">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 bg-surface-200 rounded text-[10px] font-medium text-surface-500">K</kbd>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <div className="badge-success text-xs hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block"></span>
          12 Surfaces Active
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className={`relative p-2 rounded-lg transition-colors ${
              notificationsOpen ? 'bg-surface-100 text-primary-600' : 'hover:bg-surface-50 text-surface-500 hover:text-surface-800'
            }`}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 overflow-hidden animate-slide-up">
              <div className="p-3.5 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-surface-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-surface-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 hover:bg-surface-50 transition-colors flex items-start gap-3 relative ${
                        !item.read ? 'bg-primary-50/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.type === 'success' && (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={15} />
                          </div>
                        )}
                        {item.type === 'info' && (
                          <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                            <Sparkles size={15} />
                          </div>
                        )}
                        {item.type === 'asset' && (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <UploadCloud size={15} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${!item.read ? 'text-surface-900' : 'text-surface-700'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-surface-400">{item.time}</span>
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDismissNotification(item.id)}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-surface-400 hover:text-surface-600 p-1"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-surface-100 bg-surface-50 text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/settings');
                  }}
                  className="text-xs text-surface-500 hover:text-surface-800 transition-colors font-medium"
                >
                  Notification Preferences →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Button & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-semibold cursor-pointer shadow-sm hover:ring-2 hover:ring-primary-200 transition-all"
            aria-label="User profile menu"
          >
            {user?.name?.charAt(0) || 'U'}
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 overflow-hidden animate-slide-up">
              <div className="p-4 border-b border-surface-100 bg-surface-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-surface-900 truncate">
                      {user?.name || 'Elena Rostova'}
                    </p>
                    <p className="text-xs text-surface-500 truncate">
                      {user?.email || 'elena@flam.io'}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide">
                    {user?.role || 'Lead Designer & Editor'}
                  </span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <Settings size={15} className="text-surface-400" />
                  Account & Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/surfaces');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <Layers size={15} className="text-surface-400" />
                  Surface Presets
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <ShieldCheck size={15} className="text-surface-400" />
                  Admin Console
                </button>
              </div>

              <div className="p-1.5 border-t border-surface-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
