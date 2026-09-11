import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileText,
  Eye,
  Download,
  X
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function Insurance({ vehicles, onRenewInsurance, onUpdateInsurance }) {
  
  // States
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [expiryDateInput, setExpiryDateInput] = useState('');

  // Calculate remaining days for policy
  const getDaysRemaining = (expiryDateStr) => {
    const expDate = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertLevel = (days) => {
    if (days <= 0) return { label: 'Expired', color: 'danger', level: 'danger' };
    if (days <= 15) return { label: 'Critical Due', color: 'danger', level: 'critical' };
    if (days <= 45) return { label: 'Expiring Soon', color: 'warning', level: 'warning' };
    return { label: 'Active', color: 'success', level: 'safe' };
  };

  const handleOpenUpdate = (vehicle) => {
    setSelectedVehicle(vehicle);
    setExpiryDateInput(vehicle.insuranceExpiry);
    setIsUpdateOpen(true);
  };

  const handleOpenDocs = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDocsOpen(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!expiryDateInput) return;
    onUpdateInsurance(selectedVehicle.id, expiryDateInput);
    setIsUpdateOpen(false);
  };

  // Mock document items list
  const mockDocuments = [
    { id: 1, name: 'Liability_Certificate_2026.pdf', size: '1.2 MB', date: '2026-01-15' },
    { id: 2, name: 'Fleet_Coverage_Schedule_Allianz.pdf', size: '4.8 MB', date: '2026-01-15' },
    { id: 3, name: 'Registration_Receipt.pdf', size: '320 KB', date: '2026-01-18' }
  ];

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Insurance Policies</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Audit commercial fleet coverage, track upcoming expiry limits, and register renewals.</p>
      </div>

      {/* Insurance Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => {
          const daysLeft = getDaysRemaining(vehicle.insuranceExpiry);
          const alert = getAlertLevel(daysLeft);
          const pct = Math.max(0, Math.min(100, (daysLeft / 365) * 100));

          return (
            <div
              key={vehicle.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow ${
                alert.level === 'critical' || alert.level === 'danger'
                  ? 'border-red-200 dark:border-red-950/40 ring-2 ring-red-500/5'
                  : 'dark:border-slate-800'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">{vehicle.plate}</span>
                    <h3 className="font-bold text-base text-slate-850 dark:text-slate-100 truncate mt-0.5">{vehicle.name}</h3>
                  </div>
                  
                  <Badge variant={alert.color}>
                    {alert.label}
                  </Badge>
                </div>

                {/* Expiry Info */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Coverage Ends On</span>
                      <span className="font-bold">{vehicle.insuranceExpiry}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {daysLeft > 0 ? (
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{daysLeft}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">days left</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
                        <ShieldX className="w-4 h-4" />
                        Lapsed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>Remaining Coverage</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        alert.level === 'danger' || alert.level === 'critical' ? 'bg-red-500' : alert.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Policy Provider:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350">Allianz Global Fleet Corp</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liability Coverage Limit:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350">$2,000,000 USD</span>
                  </div>
                </div>

                {/* Document link trigger */}
                <button
                  onClick={() => handleOpenDocs(vehicle)}
                  className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600 hover:underline pt-1.5"
                >
                  <FileText className="w-4 h-4" />
                  View Policy Documents ({mockDocuments.length})
                </button>
              </div>

              {/* Renewal Buttons */}
              <div className="mt-6 pt-4 border-t dark:border-slate-800 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleOpenUpdate(vehicle)}
                >
                  Adjust Date
                </Button>
                <Button
                  variant={daysLeft <= 45 ? 'danger' : 'primary'}
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                  onClick={() => onRenewInsurance(vehicle.id)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Renew (1 Yr)
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ---------------- ADJUST DATE MODAL ---------------- */}
      <Modal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`Adjust Policy Date: ${selectedVehicle?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitUpdate}>Save Date</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Policy Expiry Date"
            type="date"
            required
            value={expiryDateInput}
            onChange={(e) => setExpiryDateInput(e.target.value)}
          />
        </div>
      </Modal>

      {/* ---------------- DOCUMENTS VIEW SIDE PANEL ---------------- */}
      {isDocsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDocsOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l dark:border-slate-800 shadow-2xl flex flex-col animate-fade-in text-sm">
              <div className="p-6 border-b dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Policy Certificate</h3>
                  <span className="text-xs text-slate-400">{selectedVehicle?.plate}</span>
                </div>
                <button onClick={() => setIsDocsOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <p className="text-xs text-slate-400">
                  Archived digital copies of Allianz liability documents. Under API integration, these will directly pull from AWS S3 attachments.
                </p>

                <div className="space-y-3">
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100/50">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText className="w-8 h-8 text-sky-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-semibold block truncate text-slate-700 dark:text-slate-200">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{doc.size} | Uploaded: {doc.date}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => alert(`Simulated downloading: ${doc.name}`)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t dark:border-slate-850 flex justify-end">
                <Button variant="secondary" onClick={() => setIsDocsOpen(false)}>
                  Close Panel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
