import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { DemoBadge } from '../components/common/DemoBadge';
import {
  LayoutDashboard,
  BookOpen,
  KeyRound,
  Users,
  Bell,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  UserCog,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const settings = storageService.getClinicSettings();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/courses', label: 'Courses & Lectures', icon: BookOpen },
    { to: '/admin/keys', label: 'Access Keys', icon: KeyRound },
    { to: '/admin/students', label: 'Students & Progress', icon: Users },
    { to: '/admin/announcements', label: 'Announcements', icon: Bell },
    ...(isAdmin ? [
      { to: '/admin/staff', label: 'Staff Accounts', icon: UserCog },
      { to: '/admin/settings', label: 'Academy Settings', icon: Settings },
    ] : []),
    { to: '/admin/account', label: 'My Account', icon: UserCircle2 },
  ];
  const portalName = isAdmin ? 'Admin Portal' : 'Supervisor Portal';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">{portalName}</span>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'left-0' : '-left-full md:left-0'}`}
      >
        <div className="p-4 space-y-6">
          {/* Clinic Brand */}
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Shield className="w-5 h-5 text-teal-100" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {settings.clinicName}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                    {portalName}
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls & Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">


          <div className="flex items-center justify-between pt-2">
            {!collapsed && (
              <div className="truncate pr-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        {/* Top bar inside admin */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Nishtar Medical Academy</span>
            <span>•</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">{portalName}</span>
          </div>
          <div className="flex items-center gap-3">
            <DemoBadge />
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};
