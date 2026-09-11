import React, { useState } from 'react';
import {
  Plus,
  Search,
  Fuel,
  DollarSign,
  Calendar,
  X,
  Gauge,
  Edit2,
  Trash2,
  HelpCircle,
  BarChart2
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function FuelManagement({ fuelLogs, vehicles, onAddFuelLog, onEditFuelLog, onDeleteFuelLog }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Dialogs States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [targetLog, setTargetLog] = useState(null);

  // Form State
  const defaultForm = {
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    fuelAmount: '',
    cost: '',
    odometer: '',
    driverName: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  // Filtering
  const filteredLogs = fuelLogs.filter(log => {
    const v = vehicles.find(veh => veh.id === log.vehicleId);
    const vehicleName = v ? v.name : (log.vehicleName || '');
    const vehiclePlate = v ? v.plate : '';
    return vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.driverName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate Metrics
  const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalLiters = fuelLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
  const avgPricePerLiter = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.vehicleId) errors.vehicleId = 'Vehicle mapping is required';
    if (!formData.date) errors.date = 'Refueling date is required';
    if (isNaN(formData.fuelAmount) || Number(formData.fuelAmount) <= 0) {
      errors.fuelAmount = 'Fuel volume must be a positive number';
    }
    if (isNaN(formData.cost) || Number(formData.cost) <= 0) {
      errors.cost = 'Total cost must be a positive number';
    }
    if (isNaN(formData.odometer) || Number(formData.odometer) < 0) {
      errors.odometer = 'Odometer reading must be a positive number';
    }
    if (!formData.driverName.trim()) errors.driverName = 'Driver log signature is required';
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
      date: log.date,
      fuelAmount: log.fuelAmount,
      cost: log.cost,
      odometer: log.odometer,
      driverName: log.driverName
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
    onAddFuelLog({
      ...formData,
      id: Date.now(),
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      fuelAmount: parseFloat(formData.fuelAmount),
      cost: parseFloat(formData.cost),
      odometer: parseInt(formData.odometer)
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    onEditFuelLog({
      ...formData,
      id: targetLog.id,
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      fuelAmount: parseFloat(formData.fuelAmount),
      cost: parseFloat(formData.cost),
      odometer: parseInt(formData.odometer)
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteFuelLog(targetLog.id);
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fuel Management</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor efficiency statistics, log refueling entries, and audit fleet consumption costs.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Log Refueling
        </Button>
      </div>

      {/* Fuel Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 text-sky-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-xs block">Total Refueling Spend</span>
            <span className="text-xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-xs block">Total Fuel Volume</span>
            <span className="text-xl font-bold">{totalLiters.toLocaleString()} Liters</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-xs block">Average Price Per Liter</span>
            <span className="text-xl font-bold">${avgPricePerLiter} / L</span>
          </div>
        </div>
      </div>

      {/* Logs Table Area */}
      <div className="p-6 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4.5 h-4.5 text-sky-500" />
            Refueling Logbook
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by vehicle or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center">
            <HelpCircle className="w-8 h-8 text-slate-500 mb-2" />
            <span>No refueling entries match filters</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b dark:border-slate-800/80">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Vehicle</th>
                  <th className="pb-3 font-semibold">Odometer Reading</th>
                  <th className="pb-3 font-semibold">Volume (Liters)</th>
                  <th className="pb-3 font-semibold">Total Cost</th>
                  <th className="pb-3 font-semibold">Driver Name</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800/50">
                {filteredLogs.map((log) => {
                  const vehicle = vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35">
                      <td className="py-3.5 font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {log.date}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold">{vehicle ? vehicle.name : log.vehicleName}</span>
                          <span className="text-[10px] text-slate-400">{vehicle ? vehicle.plate : ''}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-semibold">
                        {log.odometer.toLocaleString()} km
                      </td>
                      <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        {log.fuelAmount} L
                      </td>
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                        ${log.cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {log.driverName}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1">
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
        )}
      </div>

      {/* ---------------- ADD ENTRY MODAL ---------------- */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Refueling Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Save Entry</Button>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Odometer (km)"
                type="number"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                error={formErrors.odometer}
              />
            </div>
            <div>
              <Input
                label="Refueling Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />
            </div>
            <div>
              <Input
                label="Fuel Volume (Liters)"
                type="number"
                step="0.01"
                value={formData.fuelAmount}
                onChange={(e) => setFormData({ ...formData, fuelAmount: e.target.value })}
                error={formErrors.fuelAmount}
              />
            </div>
            <div>
              <Input
                label="Total Cost ($)"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                error={formErrors.cost}
              />
            </div>
          </div>

          <Input
            label="Driver Log Name"
            value={formData.driverName}
            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            error={formErrors.driverName}
          />
        </div>
      </Modal>

      {/* ---------------- EDIT ENTRY MODAL ---------------- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Refueling Entry"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Odometer (km)"
                type="number"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                error={formErrors.odometer}
              />
            </div>
            <div>
              <Input
                label="Refueling Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={formErrors.date}
              />
            </div>
            <div>
              <Input
                label="Fuel Volume (Liters)"
                type="number"
                step="0.01"
                value={formData.fuelAmount}
                onChange={(e) => setFormData({ ...formData, fuelAmount: e.target.value })}
                error={formErrors.fuelAmount}
              />
            </div>
            <div>
              <Input
                label="Total Cost ($)"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                error={formErrors.cost}
              />
            </div>
          </div>

          <Input
            label="Driver Log Name"
            value={formData.driverName}
            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            error={formErrors.driverName}
          />
        </div>
      </Modal>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Fuel Entry"
        message="Are you sure you want to delete this fuel log entry? Mileage audit histories will adjust."
      />

    </div>
  );
}
