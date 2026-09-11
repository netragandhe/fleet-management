import React, { useState } from 'react';
import {
  FileCheck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileText,
  Eye,
  Download,
  X,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Clock,
  ShieldCheck,
  ShieldX,
  Building2,
  Award
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Keuring({
  keuringRecords,
  vehicles,
  onAddKeuring,
  onEditKeuring,
  onDeleteKeuring,
  onOpenExport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);

  // Form State
  const defaultForm = {
    vehicleId: '',
    certificateId: '',
    lastInspectionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    station: '',
    result: 'passed',
    status: 'valid',
    inspectorName: '',
    notes: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  // Helper for days remaining
  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return 0;
    const expDate = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status, daysLeft) => {
    if (status === 'expired' || daysLeft <= 0) return { label: 'Expired', variant: 'danger' };
    if (status === 'expiring_soon' || daysLeft <= 30) return { label: 'Expiring Soon', variant: 'warning' };
    if (status === 'pending') return { label: 'Pending Inspection', variant: 'info' };
    return { label: 'Valid Safety Pass', variant: 'success' };
  };

  // Filtered dataset
  const filteredRecords = keuringRecords.filter(rec => {
    const v = vehicles.find(veh => veh.id === rec.vehicleId);
    const vehicleName = v ? v.name : (rec.vehicleName || '');
    const vehiclePlate = v ? v.plate : (rec.plate || '');
    const matchesSearch = vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.certificateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const validCount = keuringRecords.filter(r => r.status === 'valid').length;
  const expiringSoonCount = keuringRecords.filter(r => r.status === 'expiring_soon' || (getDaysRemaining(r.expiryDate) > 0 && getDaysRemaining(r.expiryDate) <= 30)).length;
  const expiredCount = keuringRecords.filter(r => r.status === 'expired' || getDaysRemaining(r.expiryDate) <= 0).length;

  const validateForm = () => {
    const errors = {};
    if (!formData.vehicleId) errors.vehicleId = 'Vehicle association is required';
    if (!formData.certificateId.trim()) errors.certificateId = 'Certificate ID is required';
    if (!formData.expiryDate) errors.expiryDate = 'Next inspection expiry date is required';
    if (!formData.station.trim()) errors.station = 'Testing station name is required';
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

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      ...rec,
      vehicleId: rec.vehicleId
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDelete = (rec) => {
    setSelectedRecord(rec);
    setIsDeleteOpen(true);
  };

  const handleOpenDoc = (rec) => {
    setSelectedRecord(rec);
    setIsDocOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    const days = getDaysRemaining(formData.expiryDate);
    const computedStatus = days <= 0 ? 'expired' : days <= 30 ? 'expiring_soon' : 'valid';

    onAddKeuring({
      ...formData,
      id: Date.now(),
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      plate: selVehicle ? selVehicle.plate : '',
      status: computedStatus
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    const days = getDaysRemaining(formData.expiryDate);
    const computedStatus = days <= 0 ? 'expired' : days <= 30 ? 'expiring_soon' : 'valid';

    onEditKeuring({
      ...formData,
      id: selectedRecord.id,
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'Unknown Vehicle',
      plate: selVehicle ? selVehicle.plate : '',
      status: computedStatus
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteKeuring(selectedRecord.id);
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Title Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Keuring / Safety Inspections</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor roadworthiness certificates, technical periodic inspections (APK), and safety compliance.</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenExport && (
            <Button variant="outline" onClick={() => onOpenExport('keuring')} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Keuring
            </Button>
          )}
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Inspection
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold block mb-1">Valid Keuring Certificates</span>
            <span className="text-2xl font-bold text-emerald-500">{validCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold block mb-1">Expiring within 30 Days</span>
            <span className="text-2xl font-bold text-amber-500">{expiringSoonCount}</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold block mb-1">Lapsed / Expired Inspections</span>
            <span className="text-2xl font-bold text-rose-500">{expiredCount}</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl">
            <ShieldX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vehicle, plate, or certificate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Inspection Statuses</option>
            <option value="valid">Valid Safety Pass</option>
            <option value="expiring_soon">Expiring Soon (30 Days)</option>
            <option value="expired">Expired / Grounded</option>
          </select>
        </div>
      </div>

      {/* Keuring Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((rec) => {
          const vehicle = vehicles.find(v => v.id === rec.vehicleId);
          const daysLeft = getDaysRemaining(rec.expiryDate);
          const badge = getStatusBadge(rec.status, daysLeft);
          const pct = Math.max(0, Math.min(100, (daysLeft / 365) * 100));

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow ${
                badge.variant === 'danger'
                  ? 'border-red-200 dark:border-red-950/40 ring-2 ring-red-500/5'
                  : 'dark:border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                      {vehicle ? vehicle.plate : rec.plate}
                    </span>
                    <h3 className="font-bold text-base text-slate-850 dark:text-slate-100 truncate mt-0.5">
                      {vehicle ? vehicle.name : rec.vehicleName}
                    </h3>
                  </div>
                  <Badge variant={badge.variant}>
                    {badge.label}
                  </Badge>
                </div>

                {/* Expiry Banner */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Keuring Expiry Date</span>
                      <span className="font-bold">{rec.expiryDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {daysLeft > 0 ? (
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{daysLeft}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">days left</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-rose-500 uppercase flex items-center gap-1">
                        <ShieldX className="w-4 h-4" />
                        Expired
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>Certificate Validity</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.variant === 'danger' ? 'bg-rose-500' : badge.variant === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Certificate ID:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{rec.certificateId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inspection Station:</span>
                    <span className="font-semibold truncate max-w-[160px] text-slate-700 dark:text-slate-300">{rec.station}</span>
                  </div>
                </div>

                {/* Document link trigger */}
                <button
                  onClick={() => handleOpenDoc(rec)}
                  className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600 hover:underline pt-1"
                >
                  <FileText className="w-4 h-4" />
                  View Certificate PDF Attachment
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenEdit(rec)}
                >
                  Edit Details
                </Button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDelete(rec)}
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

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Technical Keuring Certificate"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Save Certificate</Button>
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
            label="Certificate / Inspection ID"
            value={formData.certificateId}
            onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
            placeholder="e.g. APK-NL-2026-90412"
            error={formErrors.certificateId}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Inspection Date"
              type="date"
              value={formData.lastInspectionDate}
              onChange={(e) => setFormData({ ...formData, lastInspectionDate: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              error={formErrors.expiryDate}
            />
          </div>

          <Input
            label="Approved Inspection Station"
            value={formData.station}
            onChange={(e) => setFormData({ ...formData, station: e.target.value })}
            placeholder="e.g. DEKRA Technical Base"
            error={formErrors.station}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Inspection Outcome Result</label>
            <select
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              <option value="passed">Full Pass (Approved)</option>
              <option value="conditional">Conditional Pass (Re-test Required)</option>
              <option value="failed">Failed Inspection (Grounded)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Inspector Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
              placeholder="Emissions test results, brake measurements..."
            />
          </div>
        </div>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Keuring Certificate"
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

          <Input
            label="Certificate / Inspection ID"
            value={formData.certificateId}
            onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
            error={formErrors.certificateId}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Inspection Date"
              type="date"
              value={formData.lastInspectionDate}
              onChange={(e) => setFormData({ ...formData, lastInspectionDate: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              error={formErrors.expiryDate}
            />
          </div>

          <Input
            label="Approved Inspection Station"
            value={formData.station}
            onChange={(e) => setFormData({ ...formData, station: e.target.value })}
            error={formErrors.station}
          />
        </div>
      </Modal>

      {/* ---------------- DOCUMENT SIDE DRAWER ---------------- */}
      {isDocOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDocOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l dark:border-slate-800 shadow-2xl flex flex-col z-50 animate-fade-in text-sm">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Keuring Certificate Document</h3>
                  <span className="text-xs text-slate-400">{selectedRecord?.certificateId}</span>
                </div>
                <button onClick={() => setIsDocOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-sky-500" />
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-100">{selectedRecord?.documentUrl || 'Safety_Pass_PDF.pdf'}</span>
                      <span className="text-[10px] text-slate-400 block">Verified Official Document</span>
                    </div>
                  </div>
                  <button onClick={() => alert(`Simulated downloading: ${selectedRecord?.documentUrl}`)} className="p-2 text-slate-400 hover:text-slate-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t dark:border-slate-800 flex justify-end">
                <Button variant="secondary" onClick={() => setIsDocOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Keuring Record"
        message="Are you sure you want to remove this technical safety inspection record?"
      />

    </div>
  );
}
