import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Navigation,
  Activity,
  Layers,
  MapPin,
  Map as MapIcon,
  Search,
  Signal,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Square,
  FastForward,
  Calendar,
  Clock,
  Gauge,
  Layers3,
  Cpu,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';

import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { mockRouteHistories } from '../mockData';

export default function LiveTracking({ vehicles }) {
  const gpsVehicles = vehicles.filter(v => v.gpsEnabled);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'playback'

  // Live Stream States
  const [selectedVehicle, setSelectedVehicle] = useState(gpsVehicles[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatedTime, setSimulatedTime] = useState(new Date());
  const [isPlayingLive, setIsPlayingLive] = useState(true);
  const [mapLayer, setMapLayer] = useState('vector'); // 'vector', 'street', 'satellite'

  // Playback States
  const [playbackVehicleId, setPlaybackVehicleId] = useState(gpsVehicles[0]?.id || 1);
  const [playbackDate, setPlaybackDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isPlaybackRunning, setIsPlaybackRunning] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x, 10x

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const startEndMarkersRef = useRef([]);

  // Active Playback Waypoints
  const waypoints = mockRouteHistories[playbackVehicleId] || mockRouteHistories[1];
  const currentWaypoint = waypoints[playbackIndex] || waypoints[0];

  // Tile Configs
  const tileSources = {
    vector: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attrib: '&copy; OpenStreetMap &copy; CARTO'
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attrib: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attrib: 'Tiles &copy; Esri'
    }
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map centered on Europe/France as default
      const initialLat = selectedVehicle?.lat || 48.8566;
      const initialLng = selectedVehicle?.lng || 2.3522;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 6,
        zoomControl: false
      });

      // Add default tile layer (CartoDB Dark)
      const tileLayer = L.tileLayer(tileSources.vector.url, {
        attribution: tileSources.vector.attrib,
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Map Layer Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const source = tileSources[mapLayer] || tileSources.vector;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(source.url, {
      attribution: source.attrib,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
  }, [mapLayer]);

  // Render Live Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== 'live') return;
    const map = mapInstanceRef.current;

    // Clear route playback polylines if switching back to live
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    startEndMarkersRef.current.forEach(m => map.removeLayer(m));
    startEndMarkersRef.current = [];

    // Update or add markers for live vehicles
    gpsVehicles.forEach(vehicle => {
      const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
      const position = [vehicle.lat, vehicle.lng];

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? '<div class="absolute w-10 h-10 rounded-full bg-sky-500/40 animate-ping"></div>' : ''}
          <div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: ${isSelected ? '#0ea5e9' : (vehicle.status === 'active' ? '#10b981' : '#f59e0b')};
            border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.3s ease;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${vehicle.course || 0}deg)">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
          <div style="
            position: absolute; top: -22px; white-space: nowrap;
            background: rgba(15, 23, 42, 0.9); color: white; padding: 2px 7px;
            border-radius: 6px; font-size: 10px; font-weight: bold; border: 1px solid #334155;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3); pointer-events: none;
          ">
            ${vehicle.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-vehicle-icon',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLatLng(position);
        markersRef.current[vehicle.id].setIcon(customIcon);
      } else {
        const marker = L.marker(position, { icon: customIcon }).addTo(map);

        // Bind popup info
        const popupContent = `
          <div class="p-2 min-w-[180px] font-sans">
            <div class="font-bold text-slate-900 text-sm mb-0.5">${vehicle.name}</div>
            <div class="text-xs text-slate-500 font-mono mb-2">${vehicle.plate}</div>
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-100 p-2 rounded-lg">
              <div><span class="text-slate-400">Speed:</span> <b class="text-sky-600">${vehicle.speed} km/h</b></div>
              <div><span class="text-slate-400">Status:</span> <b class="text-emerald-600 capitalize">${vehicle.status}</b></div>
              <div><span class="text-slate-400">Driver:</span> <b>${vehicle.driverId ? 'Assigned' : 'Unassigned'}</b></div>
              <div><span class="text-slate-400">IMEI:</span> <b class="font-mono text-[10px]">${vehicle.trackerImei ? vehicle.trackerImei.slice(-5) : 'N/A'}</b></div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedVehicle(vehicle));

        markersRef.current[vehicle.id] = marker;
      }
    });

  }, [gpsVehicles, selectedVehicle, activeTab]);

  // Center Map on Selected Vehicle
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedVehicle || activeTab !== 'live') return;
    mapInstanceRef.current.flyTo([selectedVehicle.lat, selectedVehicle.lng], 12, {
      duration: 1.2
    });
  }, [selectedVehicle?.id, activeTab]);

  // Render Route Playback on Map
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== 'playback') return;
    const map = mapInstanceRef.current;

    // Clear live vehicle markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    // Remove existing polyline & markers
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }
    startEndMarkersRef.current.forEach(m => map.removeLayer(m));
    startEndMarkersRef.current = [];

    if (!waypoints || waypoints.length === 0) return;

    // Draw Polyline path
    const latLngs = waypoints.map(w => [w.lat, w.lng]);
    const polyline = L.polyline(latLngs, {
      color: '#0ea5e9',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    polylineRef.current = polyline;

    // Fit map bounds to show full route
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Start Pin (Green)
    const startPt = waypoints[0];
    const startIcon = L.divIcon({
      className: 'start-marker',
      html: `
        <div class="flex items-center gap-1.5 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-white">
          <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          START
        </div>
      `,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
    const startMarker = L.marker([startPt.lat, startPt.lng], { icon: startIcon }).addTo(map);

    // End Pin (Red)
    const endPt = waypoints[waypoints.length - 1];
    const endIcon = L.divIcon({
      className: 'end-marker',
      html: `
        <div class="flex items-center gap-1.5 bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-white">
          <div class="w-2 h-2 rounded-full bg-white"></div>
          END
        </div>
      `,
      iconSize: [70, 24],
      iconAnchor: [35, 12]
    });
    const endMarker = L.marker([endPt.lat, endPt.lng], { icon: endIcon }).addTo(map);

    startEndMarkersRef.current = [startMarker, endMarker];

  }, [activeTab, playbackVehicleId, waypoints]);

  // Update Animated Marker during Route Playback
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== 'playback' || !currentWaypoint) return;
    const map = mapInstanceRef.current;

    const position = [currentWaypoint.lat, currentWaypoint.lng];

    const playbackIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full bg-sky-500/30 animate-ping"></div>
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: #0ea5e9; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${currentWaypoint.course || 0}deg)">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
        <div style="
          position: absolute; top: -24px; white-space: nowrap;
          background: rgba(15, 23, 42, 0.95); color: #38b0f8; padding: 2px 8px;
          border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid #0285c7;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4); pointer-events: none;
        ">
          ${currentWaypoint.speed} km/h &bull; ${currentWaypoint.timestamp.split('T')[1].slice(0, 5)}
        </div>
      </div>
    `;

    const playbackIcon = L.divIcon({
      className: 'playback-active-marker',
      html: playbackIconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (markersRef.current['playback_active']) {
      markersRef.current['playback_active'].setLatLng(position);
      markersRef.current['playback_active'].setIcon(playbackIcon);
    } else {
      const m = L.marker(position, { icon: playbackIcon }).addTo(map);
      markersRef.current['playback_active'] = m;
    }

    map.panTo(position, { animate: true, duration: 0.5 });

  }, [playbackIndex, activeTab, currentWaypoint]);

  // Live Telematics Loop
  useEffect(() => {
    if (activeTab !== 'live' || !isPlayingLive) return;

    const interval = setInterval(() => {
      setSimulatedTime(new Date());
      if (selectedVehicle) {
        setSelectedVehicle(prev => {
          if (!prev) return null;
          const dLat = (Math.random() - 0.5) * 0.0003;
          const dLng = (Math.random() - 0.5) * 0.0003;
          const speedVar = (Math.random() - 0.5) * 4;
          return {
            ...prev,
            lat: Number((prev.lat + dLat).toFixed(4)),
            lng: Number((prev.lng + dLng).toFixed(4)),
            speed: Math.max(0, Math.min(120, Math.round(prev.speed + speedVar)))
          };
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedVehicle, isPlayingLive, activeTab]);

  // History Playback Animation Loop
  useEffect(() => {
    if (activeTab !== 'playback' || !isPlaybackRunning) return;

    const intervalTime = Math.max(200, 1500 / playbackSpeed);
    const interval = setInterval(() => {
      setPlaybackIndex(prev => {
        if (prev >= waypoints.length - 1) {
          setIsPlaybackRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaybackRunning, playbackSpeed, activeTab, waypoints]);

  const filteredVehicles = gpsVehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFitAllVehicles = () => {
    if (!mapInstanceRef.current || gpsVehicles.length === 0) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    if (group.getBounds().isValid()) {
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  };

  return (
    <div className="space-y-4 text-sm">

      {/* Top Header Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Telematics & Tracking</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time GPS tracking stream and historical route playback timeline.</p>
        </div>

        {/* Mode Selector Pill */}
        <div className="p-1 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex gap-1 font-bold text-xs">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'live'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live Telematics
          </button>
          <button
            onClick={() => setActiveTab('playback')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'playback'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Route Playback
          </button>
        </div>
      </div>

      {/* Main Map Container Shell */}
      <div className="h-[calc(100vh-14rem)] flex flex-col lg:flex-row gap-6">

        {/* Sidebar Controls Panel (Left) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 overflow-hidden shadow-sm">

          {activeTab === 'live' ? (
            /* Live Stream Sidebar */
            <>
              <div className="space-y-3.5 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm">Active GPS Trackers</h3>
                  <Badge variant="info">{gpsVehicles.length} Online</Badge>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active trackers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredVehicles.map((vehicle) => {
                  const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-sm'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold truncate text-slate-800 dark:text-slate-200 block">{vehicle.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">{vehicle.plate}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          vehicle.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                        }`}>
                          {isSelected ? `${selectedVehicle.speed} km/h` : `${vehicle.speed} km/h`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t dark:border-slate-800 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${isPlayingLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
                  Telematics Socket Feed
                </span>
                <button
                  onClick={() => setIsPlayingLive(!isPlayingLive)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                >
                  {isPlayingLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            /* Route Playback Filter Sidebar */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-sky-500" />
                  Route History Query
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Vehicle</label>
                  <select
                    value={playbackVehicleId}
                    onChange={(e) => {
                      setPlaybackVehicleId(parseInt(e.target.value));
                      setPlaybackIndex(0);
                      setIsPlaybackRunning(false);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-medium"
                  >
                    {gpsVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Playback Date</label>
                  <input
                    type="date"
                    value={playbackDate}
                    onChange={(e) => setPlaybackDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 focus:border-sky-500 focus:outline-none rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setPlaybackIndex(0);
                    setIsPlaybackRunning(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-2"
                >
                  <Play className="w-4 h-4" />
                  Load Route History
                </Button>
              </div>

              {/* Trip Summary Panel */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block border-b dark:border-slate-800 pb-1.5">Trip Summary Metrics</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Distance:</span>
                  <span className="font-bold text-sky-500">184.2 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trip Duration:</span>
                  <span className="font-bold">4h 22m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Speed:</span>
                  <span className="font-bold text-rose-500">82 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Moving Speed:</span>
                  <span className="font-bold">68 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Idle / Stop Time:</span>
                  <span className="font-bold text-amber-500">18 mins</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Map Canvas Window (Right) */}
        <div className="flex-1 flex flex-col bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden relative shadow-sm">

          {/* Layer switcher & Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex gap-2">
            <button
              onClick={handleFitAllVehicles}
              className="bg-white/90 dark:bg-slate-950/90 border dark:border-slate-800 p-2 rounded-xl shadow-lg backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 transition-colors"
              title="Fit all fleet vehicles in view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="bg-white/95 dark:bg-slate-950/95 border dark:border-slate-800 rounded-xl shadow-lg backdrop-blur-md p-1.5 flex gap-1 text-[10px] font-bold text-slate-500">
              {['vector', 'street', 'satellite'].map(layer => (
                <button
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    mapLayer === layer ? 'bg-sky-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

          {/* Interactive Playback Timeline Control Bar (Bottom Overlay) */}
          {activeTab === 'playback' && (
            <div className="p-4 bg-white/95 dark:bg-slate-950/95 border-t dark:border-slate-800 backdrop-blur-md space-y-3 z-[1000]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaybackRunning(!isPlaybackRunning)}
                    className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                  >
                    {isPlaybackRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaybackRunning(false);
                      setPlaybackIndex(0);
                    }}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                  >
                    <Square className="w-4 h-4" />
                  </button>

                  {/* Speed Multiplier Pill */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl font-bold text-[10px]">
                    {[1, 2, 5, 10].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          playbackSpeed === speed ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waypoint time indicator */}
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Timestamp: </span>
                  <span className="font-bold text-sky-500">{currentWaypoint?.timestamp}</span>
                </div>
              </div>

              {/* Timeline Scrubbing Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">08:00</span>
                <input
                  type="range"
                  min="0"
                  max={waypoints.length - 1}
                  value={playbackIndex}
                  onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                  className="flex-1 accent-sky-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 font-mono">18:00</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
