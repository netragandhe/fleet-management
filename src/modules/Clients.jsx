import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Truck,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Globe,
  Briefcase
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Clients({ clients, vehicles, drivers, onAddClient, onEditClient, onDeleteClient, onSelectClient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetClient, setTargetClient] = useState(null);

  const defaultForm = {
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Client company name is required';
    if (!formData.code.trim()) errs.code = 'Client unique code is required';
    if (!formData.email.trim()) errs.email = 'Primary contact email is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (client, e) => {
    e.stopPropagation();
    setTargetClient(client);
    setFormData({ ...client });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDelete = (client, e) => {
    e.stopPropagation();
    setTargetClient(client);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddClient({
      ...formData,
      id: Date.now(),
      vehicleCount: 0,
      driverCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onEditClient({
      ...formData,
      id: targetClient.id
    });
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteClient(targetClient.id);
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Title Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Organizations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage multi-tenant client accounts, active subscriptions, and enterprise fleet allocations.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Client Tenant
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const clientVehicles = vehicles.filter(v => v.clientId === client.id).length;
          const clientDrivers = drivers.filter(d => d.clientId === client.id).length;

          return (
            <div
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className="rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col justify-between hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-xl border border-sky-100 dark:border-sky-900/30">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-850 dark:text-slate-100 group-hover:text-sky-500 transition-colors">
                        {client.name}
                      </h3>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 mt-1 inline-block">
                        {client.code}
                      </span>
                    </div>
                  </div>
                  <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                    {client.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-500 rounded-lg border border-sky-100 dark:border-sky-900/40">
                      <Truck className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Vehicles</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{clientVehicles} Fleet Units</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <Users className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Drivers</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{clientDrivers} Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-sky-500 font-bold hover:underline flex items-center gap-1">
                  Switch to Fleet View →
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(client, e)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDelete(client, e)}
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
        title="Create New Client Tenant Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Create Client</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Client Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Wishu Transport"
            error={formErrors.name}
          />

          <Input
            label="Unique Client Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. WISHU-TR"
            error={formErrors.code}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primary Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@wishutransport.com"
              error={formErrors.email}
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+31 20 555 0192"
            />
          </div>

          <Input
            label="Headquarters Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Logistics Park Hub 4, Amsterdam"
          />
        </div>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Client: ${targetClient?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Client Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            label="Unique Client Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            error={formErrors.code}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primary Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Headquarters Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Deregister Client Organization"
        message="Are you sure you want to remove this client tenant account? Linked vehicle records will need to be reallocated."
      />

    </div>
  );
}
