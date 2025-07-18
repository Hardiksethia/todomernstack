import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  Plus, 
  Settings, 
  LogOut,
  Calendar,
  CheckCircle,
  User,
  Menu,
  BarChart3,
  X as CloseIcon
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/my-tasks', label: 'My Tasks', icon: ListTodo },
    { path: '/completed', label: 'Completed', icon: CheckCircle },
    { path: '/add-task', label: 'Add Task', icon: Plus },
    { path: '/profile', label: 'Settings', icon: Settings },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    onLogout();
  };

  // Sidebar content as a function for reuse
  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-orange-400/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <CheckSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">ToDo App</h2>
            <p className="text-orange-100 text-sm">Organize your life</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button className="lg:hidden ml-2 p-2 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
          <CloseIcon size={24} />
        </button>
      </div>
      {/* Navigation */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                    : 'text-orange-100 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setOpen(false)} // Close sidebar on mobile nav
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* User Profile & Logout */}
      <div className="p-6 border-t border-orange-400/30">
        {user && (
          <div className="mb-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-orange-200 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-orange-100 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-200">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-orange-500 text-white shadow-lg lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={28} />
      </button>
      {/* Sidebar drawer for mobile, static for desktop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${open ? 'block opacity-100' : 'hidden opacity-0'} lg:hidden`}
        onClick={() => setOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-orange-500 via-orange-600 to-red-600 text-white shadow-2xl transform transition-transform duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:flex flex-col min-h-screen`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar; 