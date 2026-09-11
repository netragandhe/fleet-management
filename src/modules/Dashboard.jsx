import React from 'react';
import Badge from '../components/ui/Badge';
import {
  Truck,
  Zap,
  Wrench,
  Compass,
  AlertTriangle,
  Flame,
  Activity,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Building2,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard({
  vehicles,
  drivers,
  fuelLogs,
  maintenanceLogs,
  keuringRecords,
  notifications,
  setCurrentTab,
  selectedClientId,
  clients
}) {
  // Filter datasets by active client
  const activeVehicles = vehicles.filter(v => selectedClientId === 'all' || v.clientId === parseInt(selectedClientId));
  const activeKeuring = keuringRecords.filter(r => selectedClientId === 'all' || r.clientId === parseInt(selectedClientId));

  // Metrics
  const totalVehicles = activeVehicles.length;
  const activeFleet = activeVehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = activeVehicles.filter(v => v.status === 'maintenance').length;
  const gpsVehicles = activeVehicles.filter(v => v.gpsEnabled).length;
  const nonGpsVehicles = activeVehicles.filter(v => !v.gpsEnabled).length;

  // Insurance & Keuring Expirations (< 30 days)
  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const expDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const insuranceAlertCount = activeVehicles.filter(v => isExpiringSoon(v.insuranceExpiry)).length;
  const keuringAlertCount = activeKeuring.filter(r => r.status === 'expired' || r.status === 'expiring_soon' || isExpiringSoon(r.expiryDate)).length;
  const upcomingMaintenanceCount = maintenanceLogs.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length;

  const statusDistribution = [
    { name: 'Active Fleet', value: activeFleet, color: '#0ea5e9' },
    { name: 'In Maintenance', value: maintenanceVehicles, color: '#f59e0b' },
    { name: 'Inactive / Yard', value: activeVehicles.filter(v => v.status === 'inactive').length, color: '#64748b' }
  ];

  const fuelTrendData = fuelLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    liters: log.fuelAmount,
    cost: log.cost
  })).reverse();

  const activeClientObj = clients.find(c => c.id === parseInt(selectedClientId));

  const cards = [
    { title: 'Total Vehicles', value: totalVehicles, icon: Truck, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30' },
    { title: 'Active Operational', value: activeFleet, icon: Zap, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'In Maintenance', value: maintenanceVehicles, icon: Wrench, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Keuring Expiring', value: keuringAlertCount, icon: FileCheck, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30', alert: keuringAlertCount > 0 },
    { title: 'Insurance Alerts', value: insuranceAlertCount, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30', alert: insuranceAlertCount > 0 },
    { title: 'Upcoming Service', value: upcomingMaintenanceCount, icon: Clock, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Fleet Dashboard</h2>
            <Badge variant="info">
              {activeClientObj ? activeClientObj.name : 'All Clients View'}
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time status overview, telematics metrics, Keuring safety compliance, and alerts.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">Traccar Link Status: Ready</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between ${
                card.alert ? 'ring-2 ring-rose-500/20 border-rose-200 dark:border-rose-950/35' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold">{card.value}</span>
                {card.alert && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">Requires Attention</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fuel Consumption Trend (Left) */}
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-sm tracking-tight">Fuel Consumption Trend</h3>
              <p className="text-xs text-slate-400">Total liters filled and associated logs over recent dates</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-500">
              <span className="px-2.5 py-1 bg-white dark:bg-slate-900 shadow-sm rounded text-slate-800 dark:text-slate-200">Volume (L)</span>
            </div>
          </div>
          
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="liters" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorLiters)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Allocation Pie Chart (Right) */}
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight mb-1">Fleet Status Distribution</h3>
            <p className="text-xs text-slate-400">Current operational status ratio</p>
          </div>

          <div className="h-44 my-4 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold">{totalVehicles}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Fleet Units</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t dark:border-slate-800 text-center text-xs">
            {statusDistribution.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xs font-semibold flex items-center gap-1.5 justify-center">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Live Telematics & Attention Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Telematics Feed Table */}
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
                Live Telematics Stream
              </h3>
              <p className="text-xs text-slate-400">Real-time address and speed indicators matching Traccar socket broadcasts</p>
            </div>
            <button
              onClick={() => setCurrentTab('live-tracking')}
              className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 hover:underline"
            >
              Open Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b dark:border-slate-800">
                  <th className="pb-3 font-semibold">Vehicle</th>
                  <th className="pb-3 font-semibold">Speed</th>
                  <th className="pb-3 font-semibold">Geocoded Address</th>
                  <th className="pb-3 font-semibold text-right">Telemetry Time</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800/50">
                {activeVehicles.filter(v => v.gpsEnabled).slice(0, 4).map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                    <td className="py-3.5 pr-2 font-medium">
                      <div className="flex flex-col">
                        <span className="font-bold">{act.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{act.plate}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        act.speed > 80 ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-sky-100 dark:bg-sky-950 text-sky-600'
                      }`}>
                        {act.speed} km/h
                      </span>
                    </td>
                    <td className="py-3.5 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {act.address}
                    </td>
                    <td className="py-3.5 text-right text-slate-400 font-mono">
                      {new Date(act.lastUpdate).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attention Alerts Widget */}
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Critical Action Attention
            </h3>
            <p className="text-xs text-slate-400">Keuring expirations, insurance policies, and maintenance</p>
          </div>

          <div className="my-4 space-y-3 flex-1">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  notif.severity === 'critical'
                    ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-950/30 text-red-600 dark:text-red-400'
                    : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold">{notif.vehicleName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentTab('notifications')}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl text-xs font-bold text-center border dark:border-slate-800 transition-all active:scale-[0.98]"
          >
            Review Alerts Center
          </button>
        </div>

      </div>

    </div>
  );
}
