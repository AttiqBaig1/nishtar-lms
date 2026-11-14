import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, BookOpen, KeyRound, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser, role } = useAuth();

  // Only render on student or non-admin screens
  if (role === 'admin' || role === 'supervisor') return null;

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: currentUser ? '/dashboard' : '/login', label: 'My Courses', icon: BookOpen },
    { to: currentUser ? '/account' : '/login', label: 'Access Key', icon: KeyRound },
    { to: currentUser ? '/account' : '/login', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 md:hidden backdrop-blur-md pb-safe">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
