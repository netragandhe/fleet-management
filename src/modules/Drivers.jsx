import React, { useState } from 'react';
import {
  Plus,
  Search,
  UserCheck,
  UserMinus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  X,
  CreditCard,
  Briefcase,
  ArrowLeft,
  Award,
  Clock,
  Car
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Drivers({
  drivers,
  vehicles,
  onAddDriver,
  onEditDriver,
  onDeleteDriver,
  onAssignDriver,
  activeDetailId,
  setActiveDetailId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Dialogs States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form State
  const defaultForm = {
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    experience: '3 years',
    status: 'active',
    assignedVehicleId: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [assignVehicleId, setAssignVehicleId] = useState('');

  // Filter
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Driver full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email format';
    }
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.length < 5) {
      errors.licenseNumber = 'License number must be at least 5 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (driver, e) => {
    e.stopPropagation();
    setSelectedDriver(driver);
    setFormData({
      ...driver,
      assignedVehicleId: driver.assignedVehicleId || ''
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenAssign = (driver, e) => {
    e.stopPropagation();
    setSelectedDriver(driver);
    setAssignVehicleId(driver.assignedVehicleId || '');
    setIsAssignOpen(true);
  };

  const handleOpenDelete = (id, e) => {
    e.stopPropagation();
    setTargetDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onAddDriver({
      ...formData,
      id: Date.now(),
      assignedVehicleId: formData.assignedVehicleId ? parseInt(formData.assignedVehicleId) : null
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onEditDriver({
      ...formData,
      assignedVehicleId: formData.assignedVehicleId ? parseInt(formData.assignedVehicleId) : null
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteDriver(targetDeleteId);
    setIsDeleteOpen(false);
  };

  const handleSubmitAssign = (e) => {
    e.preventDefault();
    onAssignDriver(selectedDriver.id, assignVehicleId ? parseInt(assignVehicleId) : null);
    setIsAssignOpen(false);
  };

  // If viewing a full deep details profile view
  if (activeDetailId) {
    const driver = drivers.find(d => d.id === activeDetailId);
    if (!driver) {
      return (
        <div className="p-8 text-center border dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <span className="font-bold">Driver Profile Not Found</span>
          <Button variant="secondary" className="mt-4" onClick={() => setActiveDetailId(null)}>
            Back to Registry
          </Button>
        </div>
      );
    }
    const activeVehicle = vehicles.find(v => v.id === driver.assignedVehicleId);

    // Mock vehicle assignment logs history (for UI completeness)
    const mockAssignmentHistory = [
      { id: 1, vehicleName: 'Ford Transit Express', plate: 'NY-771-FD', date: '2026-05-10 to Present', status: 'Active Assignment' },
      { id: 2, vehicleName: 'Toyota Hilux Utility', plate: 'ZA-102-TO', date: '2026-02-15 to 2026-05-08', status: 'Reassigned' }
    ];

    return (
      <div className="space-y-6">
        {/* Back navigation header */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setActiveDetailId(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{driver.name}</h2>
            <span className="text-xs text-slate-400">Driver License Profile Verification</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Portrait Card (Left) */}
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center text-center space-y-4">
            <img src={driver.avatar} alt={driver.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-850 shadow" />
            <div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <span className="text-xs text-slate-400 block mt-0.5">{driver.experience} Experience</span>
            </div>
            <Badge variant={driver.status === 'active' ? 'success' : 'default'}>
              {driver.status}
            </Badge>

            <div className="w-full border-t dark:border-slate-800 pt-4 space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{driver.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{driver.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="font-bold font-mono">{driver.licenseNumber}</span>
              </div>
            </div>
          </div>

          {/* Details timeline history (Right) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active vehicle */}
            <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Car className="w-4.5 h-4.5 text-sky-500" />
                Current Vehicle Allocation
              </h3>
              {activeVehicle ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">{activeVehicle.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{activeVehicle.plate}</span>
                  </div>
                  <Badge variant="success">Dispatched</Badge>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl text-center text-xs text-slate-400">
                  No vehicle currently mapped to this operator.
                </div>
              )}
            </div>

            {/* Historical Log */}
            <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-sky-500" />
                Vehicle Assignment History
              </h3>
              <div className="space-y-3.5">
                {mockAssignmentHistory.map(hist => (
                  <div key={hist.id} className="p-4 border dark:border-slate-800 rounded-xl flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <div>
                      <span className="font-bold block text-slate-700 dark:text-slate-200">{hist.vehicleName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{hist.plate} | {hist.date}</span>
                    </div>
                    <Badge variant={hist.status.includes('Active') ? 'success' : 'default'}>
                      {hist.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drivers Registry</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage staff directory, license validation, and driver-to-vehicle assignments.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Driver
        </Button>
      </div>

      {/* Search Filter bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drivers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Driver Cards Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="p-12 text-center border dark:border-slate-900 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
          <HelpCircle className="w-8 h-8 text-slate-400 mb-2" />
          <span className="font-bold text-slate-700 dark:text-slate-350">No drivers match search query</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {filteredDrivers.map((driver) => {
            const vehicle = vehicles.find(v => v.id === driver.assignedVehicleId);
            return (
              <div
                key={driver.id}
                onClick={() => setActiveDetailId(driver.id)}
                className="rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col justify-between hover:shadow-md cursor-pointer transition-shadow relative"
              >
                
                {/* Avatar & Status */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow"
                  />
                  <Badge variant={driver.status === 'active' ? 'success' : 'default'}>
                    {driver.status}
                  </Badge>
                </div>

                {/* Driver info */}
                <div className="space-y-3.5 flex-1">
                  <div>
                    <h3 className="font-bold text-base leading-tight">{driver.name}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {driver.experience} experience
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-4 border dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Assigned Vehicle</span>
                    {vehicle ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{vehicle.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{vehicle.plate}</span>
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-400 block py-0.5">No vehicle assigned</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="border-t dark:border-slate-800 mt-5 pt-4 flex justify-between items-center">
                  <button
                    onClick={(e) => handleOpenAssign(driver, e)}
                    className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
                      vehicle
                        ? 'text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                        : 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 border-sky-100 dark:border-sky-950/30'
                    }`}
                  >
                    {vehicle ? (
                      <>
                        <UserMinus className="w-3 h-3" />
                        Unassign
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Assign
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => handleOpenEdit(driver, e)}
                      className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(driver.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Driver Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Create Driver</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Driver Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
            error={formErrors.name}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Contact Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 123 4567"
                error={formErrors.phone}
              />
            </div>
            <div>
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@fleetflow.com"
                error={formErrors.email}
              />
            </div>
            <div>
              <Input
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="DL-NY10042"
                error={formErrors.licenseNumber}
              />
            </div>
            <div>
              <Input
                label="Years Experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="5 years"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Initial Vehicle Allocation</label>
            <select
              value={formData.assignedVehicleId}
              onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              <option value="">Unassigned</option>
              {vehicles.filter(v => !drivers.some(d => d.assignedVehicleId === v.id)).map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </div>

          <Input
            label="Avatar Image URL"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />
        </div>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Driver: ${formData.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Driver Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Contact Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={formErrors.phone}
              />
            </div>
            <div>
              <Input
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={formErrors.email}
              />
            </div>
            <div>
              <Input
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                error={formErrors.licenseNumber}
              />
            </div>
            <div>
              <Input
                label="Experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Avatar Image URL"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />
        </div>
      </Modal>

      {/* ---------------- ASSIGNMENT MODAL ---------------- */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign vehicle: ${selectedDriver?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAssign}>Save Mapping</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-400 leading-normal">
            Select a vehicle to map to this operator. Only one operator can be actively mapped to a vehicle at any time.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Vehicle</label>
            <select
              value={assignVehicleId}
              onChange={(e) => setAssignVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              <option value="">None (Unassign Operator)</option>
              {vehicles.map(v => {
                const currentDriver = drivers.find(d => d.assignedVehicleId === v.id && d.id !== selectedDriver?.id);
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plate}) {currentDriver ? `[Occupied by ${currentDriver.name}]` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Modal>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Driver Profile"
        message="Are you sure you want to delete this driver profile? All historical assignments will be archived."
      />

    </div>
  );
}
