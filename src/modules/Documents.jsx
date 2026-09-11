import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Trash2,
  Calendar,
  X,
  FileCheck,
  Building2,
  ShieldCheck
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Documents({ documents, vehicles, onAddDocument, onDeleteDocument, onOpenExport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const defaultForm = {
    vehicleId: '',
    title: '',
    category: 'Insurance',
    size: '1.5 MB'
  };
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormData({ ...defaultForm, vehicleId: vehicles[0]?.id || '' });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormErrors({ title: 'Document title is required' });
      return;
    }
    const selVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    onAddDocument({
      ...formData,
      id: Date.now(),
      vehicleId: parseInt(formData.vehicleId),
      vehicleName: selVehicle ? selVehicle.name : 'General Fleet Attachment',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-01-01'
    });
    setIsAddOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteDocument(selectedDoc.id);
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Documents</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Centralized repository for insurance policies, Keuring certificates, and vehicle registrations.</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenExport && (
            <Button variant="outline" onClick={() => onOpenExport('reports')} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Directory
            </Button>
          )}
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Document Categories</option>
            <option value="Insurance">Insurance Policies</option>
            <option value="Keuring">Keuring Certificates</option>
            <option value="Registration">Vehicle Registration</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 text-sky-500 rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge variant={doc.category === 'Keuring' ? 'warning' : 'info'}>
                  {doc.category}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{doc.title}</h3>
                <span className="text-xs text-slate-400 block mt-1">Vehicle: <b>{doc.vehicleName}</b></span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="font-semibold">{doc.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded On:</span>
                  <span className="font-semibold">{doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsPreviewOpen(true);
                }}
                className="text-xs text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview File
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => alert(`Simulated downloading: ${doc.title}`)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsDeleteOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Upload Compliance Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitAdd}>Save Document</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Map to Vehicle</label>
            <select
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
            label="Document Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Commercial_Insurance_Policy_2026.pdf"
            error={formErrors.title}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm"
            >
              <option value="Insurance">Insurance Policy</option>
              <option value="Keuring">Keuring / APK Certificate</option>
              <option value="Registration">Vehicle Registration</option>
              <option value="License">Driver License Copy</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Preview Side Drawer */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l dark:border-slate-800 shadow-2xl flex flex-col z-50 animate-fade-in text-sm">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{selectedDoc?.title}</h3>
                  <span className="text-xs text-slate-400">Category: {selectedDoc?.category}</span>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-sky-500" />
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-100">{selectedDoc?.title}</span>
                      <span className="text-[10px] text-slate-400 block">{selectedDoc?.size} | Uploaded: {selectedDoc?.uploadDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t dark:border-slate-800 flex justify-end">
                <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button>
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
        title="Delete Document"
        message="Are you sure you want to remove this compliance document?"
      />

    </div>
  );
}
