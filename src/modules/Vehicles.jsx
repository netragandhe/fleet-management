import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Compass,
  Edit2,
  Trash2,
  Eye,
  X,
  Upload,
  User,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Wrench,
  Shield,
  Gauge,
  HelpCircle,
  Signal,
  FileCheck,
  Fuel,
  FileText,
  Play,
  Download,
  Building2,
  Cpu,
  Layers
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Vehicles({
  vehicles,
  drivers,
  fuelLogs,
  maintenanceLogs,
  keuringRecords,
  documents,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  activeDetailId,
  setActiveDetailId,
  setCurrentTab,
  onOpenExport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gpsFilter, setGpsFilter] = useState('all');
  
  // Modals & Dialogs States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Form Section Tab State (1. Overview, 2. Identification, 3. Technical, 4. Traccar)
  const [formSection, setFormSection] = useState('overview');

  // Form State with extended transport fields
  const defaultForm = {
    name: '',
    plate: '',
    vin: '',
    engineNumber: '',
    make: 'Scania',
    model: '',
    manufactureYear: 2023,
    type: 'truck',
    status: 'active',
    gpsEnabled: true,
    speed: 0,
    fuelLevel: 100,
    battery: 12.6,
    address: 'Storage Yard Depot',
    driverId: '',
    odometer: 0,
    fuelType: 'Diesel',
    tankCapacity: 500,
    grossPayload: 30.0,
    netPayload: 18.0,
    traccarDeviceId: '',
    trackerImei: '',
    insuranceExpiry: '',
    keuringExpiry: '',
    maintenanceDue: '',
    photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  // 10-Tab Vehicle Detail Navigation
  const [detailTab, setDetailTab] = useState('overview');

  // Filtering
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.vin && v.vin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesGps = gpsFilter === 'all' || 
                       (gpsFilter === 'gps' && v.gpsEnabled) || 
                       (gpsFilter === 'nongps' && !v.gpsEnabled);
    return matchesSearch && matchesStatus && matchesGps;
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Vehicle model name is required';
    if (!formData.plate.trim()) errors.plate = 'License plate number is required';
    if (!formData.vin.trim()) errors.vin = 'Chassis VIN is required';
    if (!formData.insuranceExpiry) errors.insuranceExpiry = 'Insurance expiry is required';
    if (!formData.keuringExpiry) errors.keuringExpiry = 'Keuring inspection expiry is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setFormSection('overview');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (vehicle, e) => {
    if (e) e.stopPropagation();
    setFormData({
      ...vehicle,
      driverId: vehicle.driverId || '',
      traccarDeviceId: vehicle.traccarDeviceId || '',
      trackerImei: vehicle.trackerImei || ''
    });
    setFormErrors({});
    setFormSection('overview');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (id, e) => {
    if (e) e.stopPropagation();
    setTargetDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onAddVehicle({
      ...formData,
      id: Date.now(),
      driverId: formData.driverId ? parseInt(formData.driverId) : null,
      manufactureYear: parseInt(formData.manufactureYear) || 2023,
      odometer: parseInt(formData.odometer) || 0,
      tankCapacity: parseFloat(formData.tankCapacity) || 100,
      grossPayload: parseFloat(formData.grossPayload) || 0,
      netPayload: parseFloat(formData.netPayload) || 0,
      lastUpdate: new Date().toISOString()
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onEditVehicle({
      ...formData,
      driverId: formData.driverId ? parseInt(formData.driverId) : null,
      manufactureYear: parseInt(formData.manufactureYear) || 2023,
      odometer: parseInt(formData.odometer) || 0,
      tankCapacity: parseFloat(formData.tankCapacity) || 100,
      grossPayload: parseFloat(formData.grossPayload) || 0,
      netPayload: parseFloat(formData.netPayload) || 0
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteVehicle(targetDeleteId);
    setIsDeleteOpen(false);
  };

  // ---------------- DEEP 10-TAB VEHICLE DETAILS SCREEN ----------------
  if (activeDetailId) {
    const vehicle = vehicles.find(v => v.id === activeDetailId);
    if (!vehicle) {
      return (
        <div className="p-8 text-center border dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <span className="font-bold">Vehicle Record Not Found</span>
          <Button variant="secondary" className="mt-4" onClick={() => setActiveDetailId(null)}>
            Back to Directory
          </Button>
        </div>
      );
    }

    const driver = drivers.find(d => d.assignedVehicleId === vehicle.id || d.id === vehicle.driverId);
    const vFuelLogs = fuelLogs.filter(f => f.vehicleId === vehicle.id);
    const vMaintenanceLogs = maintenanceLogs.filter(m => m.vehicleId === vehicle.id);
    const vKeuringRecords = keuringRecords.filter(k => k.vehicleId === vehicle.id);
    const vDocuments = documents.filter(d => d.vehicleId === vehicle.id);

    const detailTabs = [
      { id: 'overview', label: 'Overview', icon: Eye },
      { id: 'specs', label: 'Specifications', icon: Layers },
      { id: 'gps', label: 'GPS / Telematics', icon: Gauge },
      { id: 'driver', label: 'Driver', icon: User },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
      { id: 'insurance', label: 'Insurance', icon: Shield },
      { id: 'keuring', label: 'Keuring / Inspection', icon: FileCheck },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'history', label: 'History Playback', icon: Play },
    ];

    return (
      <div className="space-y-6">
        
        {/* Header navigation bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setActiveDetailId(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{vehicle.name}</h2>
                <Badge variant={vehicle.status === 'active' ? 'success' : vehicle.status === 'maintenance' ? 'warning' : 'default'}>
                  {vehicle.status}
                </Badge>
              </div>
              <span className="text-xs text-slate-400 font-mono font-semibold">Plate: {vehicle.plate} | VIN: {vehicle.vin || 'N/A'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(vehicle)}>
              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Specs
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCurrentTab('live-tracking')}>
              <Compass className="w-3.5 h-3.5 mr-1" /> Live Location
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setCurrentTab('live-tracking')}>
              <Play className="w-3.5 h-3.5 mr-1" /> View Playback
            </Button>
          </div>
        </div>

        {/* 10-Tab Navigation Bar */}
        <div className="border-b dark:border-slate-800 flex gap-4 text-xs overflow-x-auto pb-1">
          {detailTabs.map(t => {
            const Icon = t.icon;
            const isSelected = detailTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setDetailTab(t.id)}
                className={`flex items-center gap-1.5 py-3 px-1 border-b-2 font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-sky-500 text-sky-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-4">
              <div className="h-60 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border dark:border-slate-800 shadow-sm">
                <img src={vehicle.photo} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <span className="font-bold uppercase text-[10px] text-slate-400">Quick Metrics</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Odometer:</span>
                  <span className="font-bold">{(vehicle.odometer || 0).toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="font-bold">{driver ? driver.name : 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Hardware:</span>
                  <Badge variant={vehicle.gpsEnabled ? 'info' : 'default'}>{vehicle.gpsEnabled ? 'Connected' : 'No GPS'}</Badge>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Operational Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-1">Make & Model</span>
                    <span className="font-bold text-sm">{vehicle.make || 'Scania'} {vehicle.model || vehicle.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Vehicle Classification</span>
                    <span className="font-bold text-sm capitalize">{vehicle.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Keuring Expiry Date</span>
                    <span className="font-bold text-sm text-purple-500">{vehicle.keuringExpiry || '2026-10-20'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Insurance Policy Expiry</span>
                    <span className="font-bold text-sm text-rose-500">{vehicle.insuranceExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {detailTab === 'specs' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Technical Commercial Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Chassis VIN Number</span>
                <span className="font-mono font-bold block text-sm">{vehicle.vin || 'YS2R4X20002938411'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Engine Serial Number</span>
                <span className="font-mono font-bold block text-sm">{vehicle.engineNumber || 'DC13-148-L01'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Manufacture Year</span>
                <span className="font-bold block text-sm">{vehicle.manufactureYear || 2023}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Fuel Engine Type</span>
                <span className="font-bold block text-sm">{vehicle.fuelType || 'Diesel'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Fuel Tank Volume</span>
                <span className="font-bold block text-sm">{vehicle.tankCapacity || 500} Liters</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Gross / Net Payload</span>
                <span className="font-bold block text-sm">{vehicle.grossPayload || 40.0}T / {vehicle.netPayload || 26.5}T</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: GPS / Tracking */}
        {detailTab === 'gps' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Traccar GPS Telematics Hardware</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Traccar Device ID</span>
                <span className="font-mono font-bold text-sky-500 block text-sm">{vehicle.traccarDeviceId || 101}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Tracker IMEI Code</span>
                <span className="font-mono font-bold block text-sm">{vehicle.trackerImei || '864209048123951'}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Current Live Speed</span>
                <span className="font-bold block text-sm text-sky-500">{vehicle.speed} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Driver */}
        {detailTab === 'driver' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Assigned Driver Operator</h3>
            {driver ? (
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <img src={driver.avatar} alt={driver.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-sm">{driver.name}</h4>
                  <span className="text-slate-400 block">{driver.email} | {driver.phone}</span>
                  <span className="font-mono text-slate-500 block mt-0.5">License: {driver.licenseNumber}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">No driver assigned to this vehicle.</div>
            )}
          </div>
        )}

        {/* Tab 5: Maintenance */}
        {detailTab === 'maintenance' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Vehicle Service History</h3>
            {vMaintenanceLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No maintenance records for this vehicle.</div>
            ) : (
              <div className="space-y-3">
                {vMaintenanceLogs.map(m => (
                  <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-sm">{m.serviceType}</span>
                      <span className="text-slate-400">{m.date} | Provider: {m.provider}</span>
                    </div>
                    <span className="font-bold text-sm">${m.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Fuel */}
        {detailTab === 'fuel' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Vehicle Refueling Ledger</h3>
            {vFuelLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No fuel entries for this vehicle.</div>
            ) : (
              <div className="space-y-3">
                {vFuelLogs.map(f => (
                  <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold block">{f.date} - Refuel</span>
                      <span className="text-slate-400">{f.fuelAmount} Liters @ {f.odometer} km</span>
                    </div>
                    <span className="font-bold text-sm">${f.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Insurance */}
        {detailTab === 'insurance' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Insurance Policy Coverage</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Policy Expiry:</span>
                <span className="font-bold text-rose-500">{vehicle.insuranceExpiry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Insurer Provider:</span>
                <span className="font-bold">Allianz Commercial Fleet</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Keuring */}
        {detailTab === 'keuring' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Keuring Technical Safety Certificate</h3>
            {vKeuringRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No Keuring records linked to this vehicle.</div>
            ) : (
              <div className="space-y-3">
                {vKeuringRecords.map(k => (
                  <div key={k.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{k.certificateId}</span>
                      <Badge variant={k.status === 'valid' ? 'success' : 'danger'}>{k.status}</Badge>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Inspection Date: {k.lastInspectionDate}</span>
                      <span>Expiry Date: <b>{k.expiryDate}</b></span>
                    </div>
                    <span className="text-slate-500 block">Station: {k.station}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Documents */}
        {detailTab === 'documents' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm tracking-tight border-b dark:border-slate-800 pb-2">Attached Compliance Documents</h3>
            {vDocuments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No documents attached to this vehicle.</div>
            ) : (
              <div className="space-y-3">
                {vDocuments.map(d => (
                  <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-sky-500" />
                      <div>
                        <span className="font-bold block">{d.title}</span>
                        <span className="text-[10px] text-slate-400">{d.category} | {d.size}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => alert(`Simulated preview: ${d.title}`)}>Preview</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 10: History Playback */}
        {detailTab === 'history' && (
          <div className="p-6 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs text-center py-12">
            <Play className="w-12 h-12 text-sky-500 mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-base">Route History Playback Available</h3>
            <p className="text-slate-400 max-w-md mx-auto">Review complete historical route waypoints, speed profiles, and trip stops on the interactive tracking map.</p>
            <Button variant="primary" className="mt-4" onClick={() => setCurrentTab('live-tracking')}>
              Launch Route Playback Console
            </Button>
          </div>
        )}

      </div>
    );
  }

  // ---------------- MASTER VEHICLES DIRECTORY GRID ----------------
  return (
    <div className="space-y-6 text-sm">
      {/* Title Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vehicles Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage commercial fleet units, chassis VINs, technical specs, and diagnostic status.</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenExport && (
            <Button variant="outline" onClick={() => onOpenExport('vehicles')} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Vehicles
            </Button>
          )}
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, plate, or VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={gpsFilter}
            onChange={(e) => setGpsFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Telematics</option>
            <option value="gps">GPS Tracked</option>
            <option value="nongps">Non-GPS</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const driver = drivers.find(d => d.assignedVehicleId === vehicle.id || d.id === vehicle.driverId);
          return (
            <div
              key={vehicle.id}
              onClick={() => setActiveDetailId(vehicle.id)}
              className="rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="h-44 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={vehicle.photo}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                />
                <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
                  <Badge variant={vehicle.status === 'active' ? 'success' : vehicle.status === 'maintenance' ? 'warning' : 'default'}>
                    {vehicle.status}
                  </Badge>
                  <Badge variant={vehicle.gpsEnabled ? 'info' : 'default'}>
                    {vehicle.gpsEnabled ? 'GPS' : 'No GPS'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h3 className="font-bold text-base leading-tight text-slate-800 dark:text-slate-100">{vehicle.name}</h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 mt-1 inline-block">
                    {vehicle.plate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Odometer</span>
                    <span className="font-bold">{(vehicle.odometer || 0).toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Driver</span>
                    <span className="font-bold truncate block">{driver ? driver.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/40 border-t dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-500 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Inspect Hub
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(vehicle, e)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDelete(vehicle.id, e)}
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

      {/* ---------------- EXTENDED TABBED ADD/EDIT MODAL ---------------- */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? "Register Commercial Fleet Vehicle" : `Edit Vehicle Specs: ${formData.name}`}
        footer={
          <div className="flex justify-between items-center w-full">
            <div>
              {formSection !== 'overview' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (formSection === 'traccar') setFormSection('technical');
                    else if (formSection === 'technical') setFormSection('identification');
                    else if (formSection === 'identification') setFormSection('overview');
                  }}
                >
                  ← Previous
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {formSection !== 'traccar' ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    const errors = {};
                    if (formSection === 'overview') {
                      if (!formData.name.trim()) errors.name = 'Vehicle model name is required';
                      setFormErrors(errors);
                      if (Object.keys(errors).length === 0) setFormSection('identification');
                    } else if (formSection === 'identification') {
                      if (!formData.plate.trim()) errors.plate = 'License plate is required';
                      if (!formData.vin.trim()) errors.vin = 'Chassis VIN is required';
                      if (!formData.insuranceExpiry) errors.insuranceExpiry = 'Insurance expiry is required';
                      if (!formData.keuringExpiry) errors.keuringExpiry = 'Keuring expiry is required';
                      setFormErrors(errors);
                      if (Object.keys(errors).length === 0) setFormSection('technical');
                    } else if (formSection === 'technical') {
                      setFormSection('traccar');
                    }
                  }}
                >
                  Next Step →
                </Button>
              ) : (
                <Button variant="primary" onClick={isAddOpen ? handleSubmitAdd : handleSubmitEdit}>
                  {isAddOpen ? "Register Vehicle" : "Save Specs"}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Section Tabs inside Form */}
          <div className="flex gap-2 border-b dark:border-slate-800 pb-2 overflow-x-auto">
            {[
              { id: 'overview', label: '1. General' },
              { id: 'identification', label: '2. VIN & Registration' },
              { id: 'technical', label: '3. Technical Specs' },
              { id: 'traccar', label: '4. Traccar / GPS' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormSection(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  formSection === tab.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Section 1: Overview */}
          {formSection === 'overview' && (
            <div className="space-y-3">
              <Input
                label="Vehicle Model Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Scania R450 Heavy Cargo"
                error={formErrors.name}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <Input
                label="Photo URL Link"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              />
            </div>
          )}

          {/* Form Section 2: VIN & Registration */}
          {formSection === 'identification' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="License Plate / Registration"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  error={formErrors.plate}
                />
                <Input
                  label="Chassis VIN Number"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  error={formErrors.vin}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Engine Number"
                  value={formData.engineNumber}
                  onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                />
                <Input
                  label="Manufacture Year"
                  type="number"
                  value={formData.manufactureYear}
                  onChange={(e) => setFormData({ ...formData, manufactureYear: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Insurance Expiry Date"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  error={formErrors.insuranceExpiry}
                />
                <Input
                  label="Keuring Expiry Date"
                  type="date"
                  value={formData.keuringExpiry}
                  onChange={(e) => setFormData({ ...formData, keuringExpiry: e.target.value })}
                  error={formErrors.keuringExpiry}
                />
              </div>
            </div>
          )}

          {/* Form Section 3: Technical Specs */}
          {formSection === 'technical' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fuel Engine Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <Input
                  label="Tank Volume Capacity (L/kWh)"
                  type="number"
                  value={formData.tankCapacity}
                  onChange={(e) => setFormData({ ...formData, tankCapacity: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Gross Payload Capacity (Tons)"
                  type="number"
                  step="0.1"
                  value={formData.grossPayload}
                  onChange={(e) => setFormData({ ...formData, grossPayload: e.target.value })}
                />
                <Input
                  label="Net Payload Capacity (Tons)"
                  type="number"
                  step="0.1"
                  value={formData.netPayload}
                  onChange={(e) => setFormData({ ...formData, netPayload: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Form Section 4: Traccar & Driver */}
          {formSection === 'traccar' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Traccar Device ID"
                  value={formData.traccarDeviceId}
                  onChange={(e) => setFormData({ ...formData, traccarDeviceId: e.target.value })}
                  placeholder="e.g. 101"
                />
                <Input
                  label="Tracker Hardware IMEI"
                  value={formData.trackerImei}
                  onChange={(e) => setFormData({ ...formData, trackerImei: e.target.value })}
                  placeholder="e.g. 864209048123951"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Driver Operator</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-xl text-xs"
                >
                  <option value="">Unassigned</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Deregister Vehicle"
        message="Are you sure you want to delete this commercial vehicle record?"
      />

    </div>
  );
}
