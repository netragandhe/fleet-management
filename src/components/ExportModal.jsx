import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, CheckCircle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import {
  mockVehicles,
  mockFuelLogs,
  mockMaintenanceLogs,
  mockKeuringRecords,
  mockDocuments
} from '../mockData';

export default function ExportModal({ isOpen, onClose, defaultModule = 'vehicles', onExportSuccess }) {
  const [targetModule, setTargetModule] = useState(defaultModule);
  const [exportFormat, setExportFormat] = useState('excel');
  const [dataScope, setDataScope] = useState('filtered');
  const [isExporting, setIsExporting] = useState(false);

  const modules = [
    { id: 'vehicles', label: 'Vehicle Master Directory' },
    { id: 'fuel', label: 'Fuel Logs & Expense Ledger' },
    { id: 'maintenance', label: 'Maintenance Service Records' },
    { id: 'insurance', label: 'Insurance Policy Registry' },
    { id: 'keuring', label: 'Keuring / Inspection Certificates' },
    { id: 'reports', label: 'Fleet Analytics & Summary Reports' },
  ];

  const formats = [
    { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 'csv', label: 'Comma Separated (.csv)', icon: FileCode, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30' },
    { id: 'pdf', label: 'PDF Report (.pdf)', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  ];

  const generateDataRows = (mod) => {
    switch (mod) {
      case 'fuel':
        return {
          headers: ['ID', 'Vehicle Name', 'Plate', 'Date', 'Liters', 'Cost (€)', 'Station', 'Odometer (km)'],
          rows: mockFuelLogs.map(f => [f.id, f.vehicleName, f.plate, f.date, f.liters, f.cost, f.station, f.odometer])
        };
      case 'maintenance':
        return {
          headers: ['ID', 'Vehicle Name', 'Plate', 'Service Type', 'Date', 'Cost (€)', 'Status', 'Technician/Garage'],
          rows: mockMaintenanceLogs.map(m => [m.id, m.vehicleName, m.plate, m.type, m.date, m.cost, m.status, m.garage])
        };
      case 'keuring':
        return {
          headers: ['ID', 'Vehicle Name', 'Plate', 'Certificate #', 'Last Inspection', 'Expiry Date', 'Status', 'Station', 'Inspector'],
          rows: mockKeuringRecords.map(k => [k.id, k.vehicleName, k.plate, k.certificateId, k.lastInspectionDate, k.expiryDate, k.status, k.station, k.inspectorName])
        };
      case 'insurance':
        return {
          headers: ['ID', 'Vehicle Name', 'Document Title', 'Category', 'File Size', 'Upload Date', 'Expiry Date'],
          rows: mockDocuments.map(d => [d.id, d.vehicleName, d.title, d.category, d.size, d.uploadDate, d.expiryDate])
        };
      case 'reports':
        return {
          headers: ['Metric Name', 'Current Value', 'Target', 'Status'],
          rows: [
            ['Total Active Vehicles', '12', '15', 'Optimal'],
            ['Fleet Availability Rate', '94.2%', '95%', 'Good'],
            ['Average Fuel Efficiency', '31.4 L/100km', '30.0 L/100km', 'Attention Needed'],
            ['Keuring Compliance Rate', '91.7%', '100%', 'Warning'],
            ['Total Monthly Operational Cost', '€14,850', '€15,000', 'Within Budget']
          ]
        };
      case 'vehicles':
      default:
        return {
          headers: ['ID', 'Vehicle Name', 'License Plate', 'VIN', 'Make', 'Model', 'Status', 'Odometer (km)', 'Fuel Level (%)', 'GPS Enabled', 'Traccar Device ID'],
          rows: mockVehicles.map(v => [v.id, v.name, v.plate, v.vin, v.make, v.model, v.status, v.odometer, v.fuelLevel, v.gpsEnabled ? 'Yes' : 'No', v.traccarDeviceId])
        };
    }
  };

  const triggerDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (e) => {
    e.preventDefault();
    setIsExporting(true);

    setTimeout(() => {
      const { headers, rows } = generateDataRows(targetModule);
      const timestamp = new Date().toISOString().slice(0, 10);
      const filenameBase = `fleetflow_${targetModule}_export_${timestamp}`;

      if (exportFormat === 'csv') {
        const csvString = [
          headers.map(h => `"${h}"`).join(','),
          ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        triggerDownload(csvString, `${filenameBase}.csv`, 'text/csv;charset=utf-8;');
      } else if (exportFormat === 'excel') {
        const excelString = [
          headers.join('\t'),
          ...rows.map(r => r.map(cell => String(cell).replace(/\t/g, ' ')).join('\t'))
        ].join('\n');

        triggerDownload(excelString, `${filenameBase}.xlsx`, 'application/vnd.ms-excel;charset=utf-8;');
      } else if (exportFormat === 'pdf') {
        const reportTitle = modules.find(m => m.id === targetModule)?.label || 'Fleet Operations Report';
        const pdfTextContent = `========================================================================
FLEETFLOW ENTERPRISE FLEET MANAGEMENT SYSTEM
${reportTitle.toUpperCase()}
Generated on: ${new Date().toLocaleString()}
Scope: ${dataScope === 'all' ? 'All System Records' : 'Filtered Data View'}
========================================================================

${headers.join(' | ')}
------------------------------------------------------------------------
${rows.map(r => r.join(' | ')).join('\n')}

------------------------------------------------------------------------
End of Report - FleetFlow FMS System Integrity Certified
========================================================================`;

        triggerDownload(pdfTextContent, `${filenameBase}.pdf`, 'application/pdf');
      }

      setIsExporting(false);
      onClose();
      if (onExportSuccess) {
        const modLabel = modules.find(m => m.id === targetModule)?.label || 'Fleet Data';
        onExportSuccess(`Successfully downloaded ${modLabel} file in ${exportFormat.toUpperCase()} format!`);
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Fleet Operations Data"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={isExporting} onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download File
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-sm">
        {/* Module Choice */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Data Module</label>
          <select
            value={targetModule}
            onChange={(e) => setTargetModule(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-sm font-medium"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Format Selection Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Export File Format</label>
          <div className="grid grid-cols-3 gap-3">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = exportFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportFormat(fmt.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-2 ring-sky-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 dark:border-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${fmt.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{fmt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Scope Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Data Range Scope</label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
              dataScope === 'filtered' ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20' : 'dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}>
              <input
                type="radio"
                name="dataScope"
                value="filtered"
                checked={dataScope === 'filtered'}
                onChange={() => setDataScope('filtered')}
                className="w-4 h-4 text-sky-500 border-slate-300 focus:ring-sky-500"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Current Filtered View</span>
                <span className="text-[10px] text-slate-400">Export active search & category selection</span>
              </div>
            </label>

            <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
              dataScope === 'all' ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20' : 'dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}>
              <input
                type="radio"
                name="dataScope"
                value="all"
                checked={dataScope === 'all'}
                onChange={() => setDataScope('all')}
                className="w-4 h-4 text-sky-500 border-slate-300 focus:ring-sky-500"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">All System Records</span>
                <span className="text-[10px] text-slate-400">Export complete dataset history</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
