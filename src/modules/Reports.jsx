import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  Truck,
  Fuel,
  Wrench,
  ShieldCheck,
  Award,
  Clock,
  Activity,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Reports({ vehicles, fuelLogs, maintenanceLogs, keuringRecords, clients, selectedClientId, onOpenExport }) {
  const [reportCategory, setReportCategory] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter vehicles by active client
  const activeVehicles = vehicles.filter(v => selectedClientId === 'all' || v.clientId === parseInt(selectedClientId));

  // Category definitions
  const categories = [
    { id: 'overview', label: 'Fleet Overview', icon: Layers, desc: 'High level operational metrics and asset distribution' },
    { id: 'utilization', label: 'Vehicle Utilization', icon: Truck, desc: 'Operating hours vs idle ratios across fleet' },
    { id: 'mileage', label: 'Mileage / Trip Logs', icon: Activity, desc: 'Distance traveled per vehicle and route metrics' },
    { id: 'fuel', label: 'Fuel Consumption', icon: Fuel, desc: 'Fuel volume, efficiency (L/100km), and cost spend' },
    { id: 'maintenance', label: 'Maintenance Costs', icon: Wrench, desc: 'Repair expenditure and scheduled service tasks' },
    { id: 'driver', label: 'Driver Behavior', icon: Award, desc: 'Speed thresholds, safety ratings, and driving hours' },
    { id: 'compliance', label: 'Insurance & Keuring', icon: ShieldCheck, desc: 'Safety inspection pass rates and policy expirations' },
  ];

  // Chart Data Mock Generators
  const utilizationData = [
    { name: 'Mon', activeHours: 9.4, idleHours: 1.2 },
    { name: 'Tue', activeHours: 10.8, idleHours: 1.5 },
    { name: 'Wed', activeHours: 8.5, idleHours: 2.1 },
    { name: 'Thu', activeHours: 11.2, idleHours: 0.9 },
    { name: 'Fri', activeHours: 9.8, idleHours: 1.1 },
    { name: 'Sat', activeHours: 5.2, idleHours: 0.5 },
    { name: 'Sun', activeHours: 2.1, idleHours: 0.2 }
  ];

  const fuelCostData = [
    { week: 'Week 1', liters: 1240, spend: 2108 },
    { week: 'Week 2', liters: 1380, spend: 2346 },
    { week: 'Week 3', liters: 1150, spend: 1955 },
    { week: 'Week 4', liters: 1420, spend: 2414 }
  ];

  const maintenanceSpendData = [
    { month: 'Jun', spend: 1200 },
    { month: 'Jul', spend: 850 },
    { month: 'Aug', spend: 2100 },
    { month: 'Sep', spend: 1400 }
  ];

  const compliancePieData = [
    { name: 'Valid Keuring & Insurance', value: activeVehicles.filter(v => v.status === 'active').length, color: '#10b981' },
    { name: 'Expiring within 30 days', value: 2, color: '#f59e0b' },
    { name: 'Lapsed / Action Required', value: 1, color: '#ef4444' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 450);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Analytics & Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Generate executive reports, audit operational efficiency, and export regulatory compliance datasets.</p>
        </div>
        <Button variant="primary" onClick={() => onOpenExport('reports')} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Category Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = reportCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setReportCategory(cat.id)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/10'
                  : 'bg-white dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-slate-800 dark:text-slate-200">{cat.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters Controls Bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">Full Year 2026</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl px-3 py-2 font-medium focus:outline-none"
            >
              <option value="all">All Fleet Vehicles ({activeVehicles.length})</option>
              {activeVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleGenerate} loading={isGenerating} className="w-full md:w-auto">
          Generate Report
        </Button>
      </div>

      {/* Report Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Graphical Report Chart (Left) */}
        <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                {categories.find(c => c.id === reportCategory)?.label} Dashboard Chart
              </h3>
              <p className="text-xs text-slate-400">Visual analytics for selected vehicle scope and date window</p>
            </div>
            <Badge variant="info">
              {dateRange.toUpperCase()}
            </Badge>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {reportCategory === 'utilization' || reportCategory === 'mileage' ? (
                <BarChart data={utilizationData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="activeHours" fill="#0ea5e9" name="Operating Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="idleHours" fill="#f59e0b" name="Idle Hours" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : reportCategory === 'fuel' ? (
                <AreaChart data={fuelCostData}>
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="spend" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Fuel Spend ($)" />
                </AreaChart>
              ) : (
                <AreaChart data={fuelCostData}>
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="liters" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} name="Volume (L)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Breakdown / Compliance Pie (Right) */}
        <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight mb-1">Fleet Compliance Breakdown</h3>
            <p className="text-xs text-slate-400">Keuring safety pass & insurance status</p>
          </div>

          <div className="h-48 my-4 relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compliancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {compliancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t dark:border-slate-800 text-xs">
            {compliancePieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-650 dark:text-slate-350">{item.name}</span>
                </span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Summary Metrics Table */}
      <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="font-bold text-sm tracking-tight">Executive Summary Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b dark:border-slate-800">
                <th className="pb-3 font-semibold">Vehicle</th>
                <th className="pb-3 font-semibold">Plate</th>
                <th className="pb-3 font-semibold">Distance (km)</th>
                <th className="pb-3 font-semibold">Fuel Spent ($)</th>
                <th className="pb-3 font-semibold">Keuring Status</th>
                <th className="pb-3 font-semibold text-right">Insurance Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/50">
              {activeVehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="py-3.5 font-bold">{v.name}</td>
                  <td className="py-3.5 font-mono text-slate-400">{v.plate}</td>
                  <td className="py-3.5 font-semibold">{(v.odometer / 10).toLocaleString()} km</td>
                  <td className="py-3.5 font-semibold">$540.00</td>
                  <td className="py-3.5">
                    <Badge variant={v.keuringExpiry < '2026-09-10' ? 'danger' : 'success'}>
                      {v.keuringExpiry < '2026-09-10' ? 'Expired' : 'Valid Pass'}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right font-medium text-slate-400">{v.insuranceExpiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
