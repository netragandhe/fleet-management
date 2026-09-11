import React, { useState } from 'react';
import {
  Plus,
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  HelpCircle,
  Edit2,
  Trash2
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Maintenance({
  maintenanceLogs,
  vehicles,
  onAddMaintenanceLog,
  onEditMaintenanceLog,
  onDeleteMaintenanceLog,
  onUpdateMaintenanceStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState('list'); // 'list' or 'timeline'
  
  // Modals & Dialogs States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [targetLog, setTargetLog] = useState(null);

  // Form State
  const defaultForm = {
    vehicleId: '',
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    status: 'scheduled',
    notes: '',
    provider: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter
  const filteredLogs = maintenanceLogs.filter(log => {
    const v = vehicles.find(veh => veh.id === log.vehicleId);
    const vehicleName = v ? v.name : (log.vehicleName || '');
    const vehiclePlate = v ? v.plate : '';
    const matchesSearch = vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.vehicleId) errors.vehicleId = 'Vehicle mapping is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Service type/title is required';
    if (!formData.date) errors.date = 'Scheduled date is required';
    if (isNaN(formData.cost) || Number(formData.cost) < 0) {
      errors.cost = 'Estimated cost must be a positive number';
    }
    if (!formData.provider.trim()) errors.provider = 'Service center provider is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      ...defaultForm,
      vehicleId: vehicles[0]?.id || ''
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (log) => {
    setTargetLog(log);
    setFormData({
      id: log.id,
      vehicleId: log.vehicleId,
      serviceType: log.serviceType,
      date: log.date,
      cost: log.cost,
      status: log.status,
      notes: log.notes,
      provider: log.provider || ''
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDelete = (log) => {
    setTargetLog(log);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    onAddMaintenanceLog({
      ...formData,
      id: Date.now(),
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      cost: parseFloat(formData.cost)
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    onEditMaintenanceLog({
      ...formData,
      id: targetLog.id,
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      cost: parseFloat(formData.cost)
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteMaintenanceLog(targetLog.id);
    setIsDeleteOpen(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'in_progress': return <Clock className="w-3.5 h-3.5 animate-pulse" />;
      case 'scheduled': return <Calendar className="w-3.5 h-3.5" />;
      default: return <Wrench className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Service</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track diagnostics checkups, schedule engine tune-ups, and review service billing logs.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Service
        </Button>
      </div>

      {/* Filter and stats row */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search service logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* View Toggle and filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeView === 'list' ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200' : 'text-slate-500'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeView === 'timeline' ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200' : 'text-slate-500'
              }`}
            >
              Timeline UI
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Services</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center border dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
          <HelpCircle className="w-8 h-8 text-slate-400 mb-2" />
          <span className="font-bold text-slate-700 dark:text-slate-350">No maintenance schedules match filters</span>
        </div>
      ) : activeView === 'list' ? (
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b dark:border-slate-800/80">
                  <th className="pb-3 font-semibold">Service Details</th>
                  <th className="pb-3 font-semibold">Vehicle</th>
                  <th className="pb-3 font-semibold">Service Date</th>
                  <th className="pb-3 font-semibold">Cost</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800/50">
                {filteredLogs.map((log) => {
                  const vehicle = vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                      <td className="py-4 pr-3 max-w-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{log.serviceType}</span>
                          <span className="text-[10px] text-slate-400 leading-normal mt-0.5">{log.notes}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold">{vehicle ? vehicle.name : log.vehicleName}</span>
                          <span className="text-[10px] text-slate-400">{vehicle ? vehicle.plate : ''}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500">{log.date}</td>
                      <td className="py-4 font-bold text-slate-800 dark:text-slate-100">${log.cost.toFixed(2)}</td>
                      <td className="py-4">
                        <Badge variant={getStatusStyle(log.status)}>
                          <span className="flex items-center gap-1 text-[9px]">
                            {getStatusIcon(log.status)}
                            {log.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {log.status !== 'completed' && (
                            <>
                              {log.status === 'scheduled' && (
                                <button
                                  onClick={() => onUpdateMaintenanceStatus(log.id, 'in_progress')}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold shadow-sm transition-all"
                                >
                                  Start
                                </button>
                              )}
                              {log.status === 'in_progress' && (
                                <button
                                  onClick={() => onUpdateMaintenanceStatus(log.id, 'completed')}
                                  className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm transition-all"
                                >
                                  Done
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handleOpenEdit(log)}
                            className="p-1 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(log)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline UI */
        <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
            {filteredLogs.map((log) => {
              const vehicle = vehicles.find(v => v.id === log.vehicleId);
              return (
                <div key={log.id} className="relative">
                  {/* Timeline indicator node */}
                  <div className={`absolute -left-[31px] top-1.5 p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm text-white ${
                    log.status === 'completed' ? 'bg-emerald-500' : log.status === 'in_progress' ? 'bg-amber-500' : 'bg-sky-500'
                  }`}>
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-xl max-w-xl text-xs space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                        <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{log.serviceType}</h4>
                      </div>
                      <Badge variant={getStatusStyle(log.status)}>
                        {log.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-500 leading-normal">{log.notes}</p>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t dark:border-slate-800">
                      <span>Vehicle: <b>{vehicle ? vehicle.name : log.vehicleName}</b> ({vehicle?.plate})</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Cost: ${log.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- ADD SERVICE MODAL ---------------- */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Maintenance Repair"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Save Service</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Vehicle</label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>

          <Input
            label="Service Title"
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            placeholder="e.g. Break fluid swap & line checks"
            error={formErrors.serviceType}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Estimated Cost ($)"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                error={formErrors.cost}
              />
            </div>
            <div>
              <Input
                label="Scheduled Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />
            </div>
            <div>
              <Input
                label="Service Center Provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g. Scania Diagnostic Clinic"
                error={formErrors.provider}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Repair / Diagnostic Notes</label>
            <textarea
              rows="3"
              placeholder="Provide details about symptoms, diagnostic codes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* ---------------- EDIT SERVICE MODAL ---------------- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Maintenance Log"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Vehicle</label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>

          <Input
            label="Service Title"
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            error={formErrors.serviceType}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Estimated Cost ($)"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                error={formErrors.cost}
              />
            </div>
            <div>
              <Input
                label="Scheduled Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />
            </div>
            <div>
              <Input
                label="Service Center Provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                error={formErrors.provider}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Repair / Diagnostic Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service Log"
        message="Are you sure you want to remove this maintenance entry? Historical timelines will adapt."
      />

    </div>
  );
}
