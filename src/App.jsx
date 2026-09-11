import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import ToastContainer from './components/ui/Toast';
import ExportModal from './components/ExportModal';

// Modules imports
import Dashboard from './modules/Dashboard';
import Vehicles from './modules/Vehicles';
import Drivers from './modules/Drivers';
import FuelManagement from './modules/FuelManagement';
import Maintenance from './modules/Maintenance';
import Insurance from './modules/Insurance';
import Keuring from './modules/Keuring';
import LiveTracking from './modules/LiveTracking';
import Reports from './modules/Reports';
import Clients from './modules/Clients';
import Documents from './modules/Documents';
import Notifications from './modules/Notifications';
import SettingsModule from './modules/Settings';

// Mock data imports
import {
  mockClients,
  mockVehicles,
  mockDrivers,
  mockFuelLogs,
  mockMaintenanceLogs,
  mockKeuringRecords,
  mockNotifications,
  mockDocuments,
  initialUserProfile
} from './mockData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Subrouting detail page states
  const [activeDetailVehicleId, setActiveDetailVehicleId] = useState(null);
  const [activeDetailDriverId, setActiveDetailDriverId] = useState(null);

  // Multi-Tenant Client State
  const [clients, setClients] = useState(mockClients);
  const [selectedClientId, setSelectedClientId] = useState('1'); // 1 = Wishu Transport

  // Global Unified Stores
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [drivers, setDrivers] = useState(mockDrivers);
  const [fuelLogs, setFuelLogs] = useState(mockFuelLogs);
  const [maintenanceLogs, setMaintenanceLogs] = useState(mockMaintenanceLogs);
  const [keuringRecords, setKeuringRecords] = useState(mockKeuringRecords);
  const [documents, setDocuments] = useState(mockDocuments);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [userProfile, setUserProfile] = useState(initialUserProfile);

  // Export Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDefaultModule, setExportDefaultModule] = useState('vehicles');

  // Toast Notification State
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type = 'success') => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync dark theme with HTML root tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Tab switcher with async delay simulation
  const handleTabChange = (tabId) => {
    setIsTabLoading(true);
    setActiveDetailVehicleId(null);
    setActiveDetailDriverId(null);
    setCurrentTab(tabId);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 350);
  };

  const handleOpenExport = (moduleName = 'vehicles') => {
    setExportDefaultModule(moduleName);
    setExportModalOpen(true);
  };

  // Session Handlers
  const handleLogin = (userInfo) => {
    setUser({
      ...userInfo,
      avatar: userProfile.avatar
    });
    setIsLoggedIn(true);
    addToast(`Welcome back, ${userInfo.name}!`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  // Client CRUD
  const handleAddClient = (newClient) => {
    setClients([newClient, ...clients]);
    addToast(`Client organization ${newClient.name} registered`, 'success');
  };

  const handleEditClient = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    addToast(`Client ${updatedClient.name} profile updated`, 'success');
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    addToast('Client organization deregistered', 'error');
  };

  // Vehicles CRUD
  const handleAddVehicle = (newVehicle) => {
    const v = { ...newVehicle, clientId: parseInt(selectedClientId) };
    setVehicles([v, ...vehicles]);
    if (v.driverId) {
      setDrivers(prev => prev.map(d => 
        d.id === v.driverId ? { ...d, assignedVehicleId: v.id } : d
      ));
    }
    addToast(`${v.name} added to fleet directory`, 'success');
  };

  const handleEditVehicle = (updatedVehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    addToast(`Vehicle specs for ${updatedVehicle.name} updated`, 'success');
  };

  const handleDeleteVehicle = (vehicleId) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    if (activeDetailVehicleId === vehicleId) setActiveDetailVehicleId(null);
    addToast(`${v ? v.name : 'Vehicle'} removed from fleet`, 'error');
  };

  // Drivers CRUD
  const handleAddDriver = (newDriver) => {
    const d = { ...newDriver, clientId: parseInt(selectedClientId) };
    setDrivers([d, ...drivers]);
    addToast(`Driver profile created for ${d.name}`, 'success');
  };

  const handleEditDriver = (updatedDriver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    addToast(`Driver profile updated`, 'success');
  };

  const handleDeleteDriver = (driverId) => {
    setDrivers(prev => prev.filter(d => d.id !== driverId));
    if (activeDetailDriverId === driverId) setActiveDetailDriverId(null);
    addToast('Driver profile removed', 'error');
  };

  const handleAssignDriver = (driverId, vehicleId) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) return { ...d, assignedVehicleId: vehicleId };
      if (vehicleId && d.assignedVehicleId === vehicleId) return { ...d, assignedVehicleId: null };
      return d;
    }));

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) return { ...v, driverId: driverId };
      if (v.driverId === driverId && v.id !== vehicleId) return { ...v, driverId: null };
      return v;
    }));

    addToast('Driver vehicle allocation updated', 'success');
  };

  // Fuel Logs CRUD
  const handleAddFuelLog = (newLog) => {
    const l = { ...newLog, clientId: parseInt(selectedClientId) };
    setFuelLogs([l, ...fuelLogs]);
    addToast('Refueling ticket logged', 'success');
  };

  const handleEditFuelLog = (updatedLog) => {
    setFuelLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    addToast('Fuel entry updated', 'success');
  };

  const handleDeleteFuelLog = (logId) => {
    setFuelLogs(prev => prev.filter(l => l.id !== logId));
    addToast('Fuel entry deleted', 'error');
  };

  // Maintenance CRUD
  const handleAddMaintenanceLog = (newLog) => {
    const m = { ...newLog, clientId: parseInt(selectedClientId) };
    setMaintenanceLogs([m, ...maintenanceLogs]);
    addToast(`Scheduled ${m.serviceType}`, 'success');
  };

  const handleEditMaintenanceLog = (updatedLog) => {
    setMaintenanceLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    addToast('Maintenance log updated', 'success');
  };

  const handleDeleteMaintenanceLog = (logId) => {
    setMaintenanceLogs(prev => prev.filter(l => l.id !== logId));
    addToast('Maintenance entry removed', 'error');
  };

  const handleUpdateMaintenanceStatus = (logId, newStatus) => {
    setMaintenanceLogs(prev => prev.map(l => l.id === logId ? { ...l, status: newStatus } : l));
    addToast(`Service status updated to ${newStatus.replace('_', ' ')}`, 'info');
  };

  // Insurance Actions
  const handleRenewInsurance = (vehicleId) => {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    const renewedDateStr = today.toISOString().split('T')[0];

    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, insuranceExpiry: renewedDateStr } : v));
    addToast('Insurance policy renewed for 1 year', 'success');
  };

  const handleUpdateInsurance = (vehicleId, newExpiryDate) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, insuranceExpiry: newExpiryDate } : v));
    addToast('Insurance policy date updated', 'success');
  };

  // Keuring CRUD
  const handleAddKeuring = (newRec) => {
    const k = { ...newRec, clientId: parseInt(selectedClientId) };
    setKeuringRecords([k, ...keuringRecords]);
    addToast('Keuring inspection certificate registered', 'success');
  };

  const handleEditKeuring = (updatedRec) => {
    setKeuringRecords(prev => prev.map(k => k.id === updatedRec.id ? updatedRec : k));
    addToast('Keuring certificate updated', 'success');
  };

  const handleDeleteKeuring = (recId) => {
    setKeuringRecords(prev => prev.filter(k => k.id !== recId));
    addToast('Keuring certificate removed', 'error');
  };

  // Documents CRUD
  const handleAddDocument = (newDoc) => {
    const d = { ...newDoc, clientId: parseInt(selectedClientId) };
    setDocuments([d, ...documents]);
    addToast('Compliance document uploaded', 'success');
  };

  const handleDeleteDocument = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    addToast('Document removed', 'info');
  };

  // Notifications
  const handleMarkNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All alerts marked read', 'success');
  };

  const handleUpdateProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setUser(prev => ({
      ...prev,
      name: updatedProfile.name,
      email: updatedProfile.email,
      avatar: updatedProfile.avatar
    }));
    addToast('Settings configurations saved', 'success');
  };

  // Filter datasets based on active tenant selectedClientId
  const filteredVehicles = vehicles.filter(v => selectedClientId === 'all' || v.clientId === parseInt(selectedClientId));
  const filteredDrivers = drivers.filter(d => selectedClientId === 'all' || d.clientId === parseInt(selectedClientId));
  const filteredFuelLogs = fuelLogs.filter(f => selectedClientId === 'all' || f.clientId === parseInt(selectedClientId));
  const filteredMaintenanceLogs = maintenanceLogs.filter(m => selectedClientId === 'all' || m.clientId === parseInt(selectedClientId));
  const filteredKeuringRecords = keuringRecords.filter(k => selectedClientId === 'all' || k.clientId === parseInt(selectedClientId));
  const filteredDocuments = documents.filter(doc => selectedClientId === 'all' || doc.clientId === parseInt(selectedClientId));
  const filteredNotifications = notifications.filter(n => selectedClientId === 'all' || n.clientId === parseInt(selectedClientId));

  // Module Router
  const renderTabContent = () => {
    if (isTabLoading) {
      return (
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            vehicles={filteredVehicles}
            drivers={filteredDrivers}
            fuelLogs={filteredFuelLogs}
            maintenanceLogs={filteredMaintenanceLogs}
            keuringRecords={filteredKeuringRecords}
            notifications={filteredNotifications}
            setCurrentTab={handleTabChange}
            selectedClientId={selectedClientId}
            clients={clients}
          />
        );
      case 'vehicles':
        return (
          <Vehicles
            vehicles={filteredVehicles}
            drivers={filteredDrivers}
            fuelLogs={filteredFuelLogs}
            maintenanceLogs={filteredMaintenanceLogs}
            keuringRecords={filteredKeuringRecords}
            documents={filteredDocuments}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            activeDetailId={activeDetailVehicleId}
            setActiveDetailId={setActiveDetailVehicleId}
            setCurrentTab={handleTabChange}
            onOpenExport={handleOpenExport}
          />
        );
      case 'drivers':
        return (
          <Drivers
            drivers={filteredDrivers}
            vehicles={filteredVehicles}
            onAddDriver={handleAddDriver}
            onEditDriver={handleEditDriver}
            onDeleteDriver={handleDeleteDriver}
            onAssignDriver={handleAssignDriver}
            activeDetailId={activeDetailDriverId}
            setActiveDetailId={setActiveDetailDriverId}
          />
        );
      case 'fuel':
        return (
          <FuelManagement
            fuelLogs={filteredFuelLogs}
            vehicles={filteredVehicles}
            onAddFuelLog={handleAddFuelLog}
            onEditFuelLog={handleEditFuelLog}
            onDeleteFuelLog={handleDeleteFuelLog}
          />
        );
      case 'maintenance':
        return (
          <Maintenance
            maintenanceLogs={filteredMaintenanceLogs}
            vehicles={filteredVehicles}
            onAddMaintenanceLog={handleAddMaintenanceLog}
            onEditMaintenanceLog={handleEditMaintenanceLog}
            onDeleteMaintenanceLog={handleDeleteMaintenanceLog}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
          />
        );
      case 'insurance':
        return (
          <Insurance
            vehicles={filteredVehicles}
            onRenewInsurance={handleRenewInsurance}
            onUpdateInsurance={handleUpdateInsurance}
          />
        );
      case 'keuring':
        return (
          <Keuring
            keuringRecords={filteredKeuringRecords}
            vehicles={filteredVehicles}
            onAddKeuring={handleAddKeuring}
            onEditKeuring={handleEditKeuring}
            onDeleteKeuring={handleDeleteKeuring}
            onOpenExport={handleOpenExport}
          />
        );
      case 'live-tracking':
        return <LiveTracking vehicles={filteredVehicles} />;
      case 'reports':
        return (
          <Reports
            vehicles={filteredVehicles}
            fuelLogs={filteredFuelLogs}
            maintenanceLogs={filteredMaintenanceLogs}
            keuringRecords={filteredKeuringRecords}
            clients={clients}
            selectedClientId={selectedClientId}
            onOpenExport={handleOpenExport}
          />
        );
      case 'clients':
        return (
          <Clients
            clients={clients}
            vehicles={vehicles}
            drivers={drivers}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onSelectClient={(id) => {
              setSelectedClientId(id.toString());
              handleTabChange('vehicles');
            }}
          />
        );
      case 'documents':
        return (
          <Documents
            documents={filteredDocuments}
            vehicles={filteredVehicles}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onOpenExport={handleOpenExport}
          />
        );
      case 'notifications':
        return (
          <Notifications
            notifications={filteredNotifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onDeleteNotification={handleDeleteNotification}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        );
      case 'settings':
        return (
          <SettingsModule
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        );
      default:
        return <div className="text-center font-semibold py-8">Select a sidebar module</div>;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={handleLogout}
        notifications={filteredNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        onOpenExport={handleOpenExport}
      >
        {renderTabContent()}
      </Layout>

      <ToastContainer toasts={toasts} onCloseToast={removeToast} />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultModule={exportDefaultModule}
        onExportSuccess={(msg) => addToast(msg, 'success')}
      />
    </>
  );
}
