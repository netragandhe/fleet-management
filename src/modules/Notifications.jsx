import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Compass,
  Wrench,
  Shield,
  BookmarkCheck,
  Trash2,
  SlidersHorizontal,
  HelpCircle
} from 'lucide-react';

import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Notifications({ notifications, onMarkNotificationRead, onDeleteNotification, onMarkAllRead }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifs = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'overspeed': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'offline': return <Compass className="w-5 h-5 text-slate-500" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-amber-500" />;
      case 'insurance': return <Shield className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Alerts</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Review geofence breach details, speed thresholds, and sensor alert logs.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onMarkAllRead} className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4" />
          Mark all read
        </Button>
      </div>

      {/* Tabs list */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread' },
          { id: 'overspeed', label: 'Overspeed Warnings' },
          { id: 'offline', label: 'GPS Offline Logs' },
          { id: 'maintenance', label: 'Maintenance Alerts' },
          { id: 'insurance', label: 'Insurance Expirations' }
        ].map(tab => {
          const count = tab.id === 'all' 
            ? notifications.length 
            : tab.id === 'unread' 
            ? notifications.filter(n => !n.read).length
            : notifications.filter(n => n.type === tab.id).length;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center border dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
            <span className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl mb-3">
              <Bell className="w-6 h-6" />
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">No matching alerts found</span>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${
                !notif.read ? 'ring-2 ring-sky-500/10 border-sky-200 dark:border-sky-950/20' : 'dark:border-slate-800'
              }`}
            >
              
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl shrink-0 ${
                  notif.type === 'overspeed' ? 'bg-rose-50 dark:bg-rose-950/20' :
                  notif.type === 'offline' ? 'bg-slate-50 dark:bg-slate-800/30' :
                  notif.type === 'maintenance' ? 'bg-amber-50 dark:bg-amber-950/20' :
                  'bg-purple-50 dark:bg-purple-950/20'
                }`}>
                  {getAlertIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{notif.vehicleName}</span>
                    <Badge variant={getSeverityStyle(notif.severity)}>
                      {notif.severity}
                    </Badge>
                    {!notif.read && (
                      <span className="px-1.5 py-0.5 bg-sky-500 text-white rounded text-[9px] font-bold">New</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => onMarkNotificationRead(notif.id)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Read
                  </Button>
                )}
                <button
                  onClick={() => onDeleteNotification(notif.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
