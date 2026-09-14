import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pencil,
  Monitor,
  Image,
  Layers,
  Settings,
  ShieldCheck,
  ChevronDown,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  {
    section: 'WORKSPACES',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/editor', icon: Pencil, label: 'Layouts / Editor' },
      { to: '/preview', icon: Monitor, label: 'Multi-Surface Preview' },
      { to: '/assets', icon: Image, label: 'Assets Library' },
      { to: '/surfaces', icon: Layers, label: 'Surfaces' },
    ],
  },
  {
    section: 'CONFIGURATION',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/admin', icon: ShieldCheck, label: 'Admin' },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
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

  const handleSignOut = async () => {
    setProfileOpen(false);
    if (onMobileClose) onMobileClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-surface-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo & Close Button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 6V14H2V6L8 2Z" fill="white" opacity="0.9" />
                <path d="M5 8H11M8 5V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-surface-900 text-[15px]">AdaptFlow</span>
            <span className="text-[10px] text-surface-400 ml-0.5">by Flam</span>
          </div>

          <button
            onClick={onMobileClose}
            className="p-1 rounded-md text-surface-400 hover:text-surface-700 hover:bg-surface-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider px-3 mb-2">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to === '/editor' && location.pathname.startsWith('/editor'));
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onMobileClose}
                        className={isActive ? 'nav-item-active' : 'nav-item'}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-surface-200 relative" ref={profileRef}>
          {/* Profile Menu Popover */}
          {profileOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 overflow-hidden animate-slide-up">
              <div className="p-3 border-b border-surface-100 bg-surface-50/70">
                <p className="text-xs font-bold text-surface-900 truncate">
                  {user?.name || 'Elena Rostova'}
                </p>
                <p className="text-[11px] text-surface-500 truncate">
                  {user?.email || 'elena@flam.io'}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-primary-600 uppercase">
                    {user?.role || 'Editor'}
                  </span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onMobileClose) onMobileClose();
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <Settings size={14} className="text-surface-400" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onMobileClose) onMobileClose();
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <ShieldCheck size={14} className="text-surface-400" />
                  Admin
                </button>
              </div>

              <div className="p-1 border-t border-surface-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
              profileOpen ? 'bg-surface-100' : 'hover:bg-surface-50'
            }`}
            aria-label="Toggle user profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-primary-600">● {user?.role || 'Editor'}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-surface-400 transition-transform duration-200 ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
