import React, { useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Fuel,
  Wrench,
  Shield,
  Map,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  BarChart3,
  Building2,
  FileText,
  Play,
  Download,
  ChevronDown
} from 'lucide-react';

export default function Layout({
  children,
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  user,
  onLogout,
  notifications,
  onMarkNotificationRead,
  clients,
  selectedClientId,
  setSelectedClientId,
  onOpenExport
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  // Grouped Navigation Structure
  const menuGroups = [
    {
      group: 'Fleet',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'vehicles', label: 'Vehicles', icon: Truck },
        { id: 'drivers', label: 'Drivers', icon: Users },
        { id: 'live-tracking', label: 'Live Tracking & Map', icon: Map },
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'fuel', label: 'Fuel Management', icon: Fuel },
      ]
    },
    {
      group: 'Compliance',
      items: [
        { id: 'insurance', label: 'Insurance Policies', icon: Shield },
        { id: 'keuring', label: 'Keuring / Inspection', icon: FileCheck },
        { id: 'documents', label: 'Compliance Docs', icon: FileText },
      ]
    },
    {
      group: 'Analytics',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'clients', label: 'Clients / Tenants', icon: Building2 },
        { id: 'notifications', label: 'System Alerts', icon: Bell, badgeCount: notifications.filter(n => !n.read).length },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const allItems = menuGroups.flatMap(g => g.items);
  const activeMenuItem = allItems.find(item => item.id === currentTab);
  const unreadCount = notifications.filter(n => !n.read).length;
  const activeClient = clients.find(c => c.id === parseInt(selectedClientId)) || clients[0];

  return (
    <div className={`h-screen overflow-hidden flex ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ---------------- MOBILE SIDEBAR DRAWER ---------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 animate-fade-in">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-lg text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Fleet<span className="text-sky-500">Flow</span></span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              {menuGroups.map((grp, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{grp.group}</span>
                  {grp.items.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          isActive
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badgeCount > 0 && (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isActive ? 'bg-white text-sky-500' : 'bg-red-500 text-white'}`}>
                            {item.badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t dark:border-slate-800 space-y-2 text-xs shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside
        className={`hidden lg:flex flex-col h-full shrink-0 border-r dark:border-slate-900 bg-white dark:bg-slate-900 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b dark:border-slate-900 flex items-center justify-between px-4 shrink-0">
          <div className={`flex items-center gap-2 overflow-hidden ${sidebarCollapsed ? 'mx-auto' : ''}`}>
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-lg text-white shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight">
                Fleet<span className="text-sky-500">Flow</span>
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation (Scrollable Menu) */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {menuGroups.map((grp, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{grp.group}</span>
              )}
              {grp.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    title={sidebarCollapsed ? item.label : ''}
                    className={`w-full flex items-center justify-between rounded-xl font-medium text-xs transition-all ${
                      sidebarCollapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.badgeCount > 0 && (
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isActive ? 'bg-white text-sky-500' : 'bg-red-500 text-white'}`}>
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer (Pinned to bottom) */}
        <div className="p-3 border-t dark:border-slate-900 space-y-1 shrink-0">
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs ${
              sidebarCollapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5 gap-3'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button
            onClick={onLogout}
            className={`w-full flex items-center rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-medium text-xs ${
              sidebarCollapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5 gap-3'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTAINER ---------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar Header */}
        <header className="h-16 border-b dark:border-slate-900 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          
          {/* Left: Mobile trigger, Breadcrumb & CLIENT SELECTOR */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Client Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border dark:border-slate-700/80 rounded-xl text-xs font-bold transition-all"
              >
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>{activeClient ? activeClient.name : 'Wishu Transport'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {clientDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setClientDropdownOpen(false)} />
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-40 py-1.5 text-xs animate-fade-in">
                    <div className="px-3 py-1.5 border-b dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      Switch Client Organization
                    </div>
                    {clients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedClientId(c.id.toString());
                          setClientDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium ${
                          selectedClientId.toString() === c.id.toString() ? 'text-sky-500 font-bold bg-sky-50/50 dark:bg-sky-950/20' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold">
              <span className="text-slate-400">FleetFlow</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-slate-800 dark:text-slate-200 capitalize">{activeMenuItem?.label}</span>
            </div>
          </div>

          {/* Right: Global Export Button, Notifications, User Badge */}
          <div className="flex items-center gap-3">
            
            {/* Global Export Button */}
            <button
              onClick={() => onOpenExport(currentTab)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 relative transition-transform active:scale-95"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Notification Overlay Menu */}
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-40 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b dark:border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-xs">Recent Alerts</span>
                      <span className="text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No recent alerts</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              onMarkNotificationRead(notif.id);
                              setNotificationOpen(false);
                              setCurrentTab('notifications');
                            }}
                            className={`px-4 py-3 border-b dark:border-slate-800/50 last:border-b-0 cursor-pointer flex gap-3 text-xs transition-colors ${
                              notif.read ? 'hover:bg-slate-50 dark:hover:bg-slate-800/35' : 'bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                              notif.severity === 'critical' ? 'bg-red-500' : notif.severity === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l dark:border-slate-800">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.role}</p>
              </div>
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
