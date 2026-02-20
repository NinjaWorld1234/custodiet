
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import L from 'leaflet';
import throttle from 'lodash/throttle';
import * as LucideIcons from 'lucide-react';
import { Layers, Zap, Wifi, AlertTriangle, Crosshair, Map as MapIcon, Maximize, Minimize, ChevronDown, ChevronUp, Clock, Filter, Eye, Shield, Users, Activity, Bomb, Flame } from 'lucide-react';
import { fetchSecurityEvents } from '../services/mockData';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Button, Badge } from '../components/ui/Atoms';
import { Card } from '../components/ui/Layouts';
import { UnifiedEvent } from '../types';
import { FlashAlert } from '../components/FlashAlert';
import { EventPopup } from '../components/EventPopup';
import { LiveTicker } from '../components/LiveTicker';
import { renderToString } from 'react-dom/server';

const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGlxeXJ6c3MwMnJnM2VwbG16aG5hYnJmIn0.example_placeholder';

// Severity Color Mapping
const SEVERITY_COLORS = {
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#fbbf24',
  low: '#10b981'
};

const MapDashboard: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const { language, categoryIcons } = useAppStore();
  const t = TRANSLATIONS[language];
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: fetchSecurityEvents, refetchInterval: 30000 });

  const [activeLayer, setActiveLayer] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useLeaflet, setUseLeaflet] = useState(MAPBOX_TOKEN.includes('placeholder'));
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [timeSinceLast, setTimeSinceLast] = useState<string>('00:00:00');

  const latestEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    return [...events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];
  }, [events]);

  useEffect(() => {
    if (!latestEvent) {
      setTimeSinceLast('--:--:--');
      return;
    }

    const updateTimer = () => {
      const diffStr = Math.max(0, Date.now() - new Date(latestEvent.time).getTime());
      const hours = Math.floor(diffStr / 3600000);
      const mins = Math.floor((diffStr % 3600000) / 60000);
      const secs = Math.floor((diffStr % 60000) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeSinceLast(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [latestEvent]);

  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    conflicts: true, protests: true, natural: true, cyber: true,
    health: true, terrorism: true, infrastructure: true
  });

  const [selectedSeverities, setSelectedSeverities] = useState<Record<string, boolean>>({
    critical: true, high: true, medium: true, low: true
  });

  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [alertEvent, setAlertEvent] = useState<UnifiedEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date().getTime();
    let cutOff = 0;
    if (timeRange === '1h') cutOff = now - (60 * 60 * 1000);
    else if (timeRange === '24h') cutOff = now - (24 * 60 * 60 * 1000);
    else if (timeRange === '7d') cutOff = now - (7 * 24 * 60 * 60 * 1000);
    return events.filter(e => {
      if (new Date(e.time).getTime() < cutOff) return false;
      if (!selectedCategories[e.category] && e.category !== undefined) return false;
      if (!selectedSeverities[e.severity]) return false;
      return true;
    });
  }, [events, selectedCategories, selectedSeverities, timeRange]);

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!filteredEvents) return counts;
    filteredEvents.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [filteredEvents]);

  const markers = useRef<mapboxgl.Marker[]>([]);

  const updateMapData = useCallback(throttle((currentEvents: UnifiedEvent[], activeEventId?: string) => {
    if (map.current && !useLeaflet) {
      const mapInstance = map.current;
      if (!mapInstance.getSource('events')) return;

      const geojson: any = {
        type: 'FeatureCollection',
        features: currentEvents
          .filter(e => e.lat !== undefined && e.lon !== undefined)
          .map(e => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [e.lon!, e.lat!] },
            properties: {
              ...e,
              iconColor: (SEVERITY_COLORS as any)[e.severity] || '#fff'
            }
          }))
      };
      (mapInstance.getSource('events') as mapboxgl.GeoJSONSource).setData(geojson);

      // Manage HTML Markers for unclustered points (Reliable Lucide Icons with Glow)
      markers.current.forEach(m => m.remove());
      markers.current = [];

      currentEvents.forEach(e => {
        if (e.lat && e.lon) {
          const color = (SEVERITY_COLORS as any)[e.severity] || '#fff';
          const iconName = categoryIcons[e.category] || 'Activity';
          const IconComp = (LucideIcons as any)[iconName] || LucideIcons.Activity;
          const svgHtml = renderToString(<IconComp size={20} strokeWidth={2.5} className="block" />);

          const isSelected = e.id === activeEventId;
          const scaleClass = isSelected
            ? 'scale-150 drop-shadow-[0_0_15px_currentColor] z-50'
            : 'hover:scale-125 drop-shadow-[0_0_8px_currentColor]';

          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerHTML = `
            <div class="relative group cursor-pointer transition-all duration-300 flex items-center justify-center ${scaleClass}" style="color: ${color};">
              ${svgHtml}
            </div>
          `;

          el.onclick = () => setSelectedEvent(e);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([e.lon, e.lat])
            .addTo(mapInstance);
          markers.current.push(marker);
        }
      });
    } else if (leafletMap.current && useLeaflet) {
      const lMap = leafletMap.current;
      lMap.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          lMap.removeLayer(layer);
        }
      });
      currentEvents.forEach(e => {
        if (e.lat && e.lon) {
          const color = (SEVERITY_COLORS as any)[e.severity] || '#fff';
          const iconName = categoryIcons[e.category] || 'Activity';
          const IconComp = (LucideIcons as any)[iconName] || LucideIcons.Activity;
          const svgHtml = renderToString(<IconComp size={20} strokeWidth={2.5} className="block" />);

          const isSelected = e.id === activeEventId;
          const scaleClass = isSelected
            ? 'scale-150 drop-shadow-[0_0_15px_currentColor] z-[1000]'
            : 'hover:scale-125 drop-shadow-[0_0_8px_currentColor]';

          const iconHtml = `
            <div class="transition-all duration-300 flex items-center justify-center ${scaleClass}" style="color: ${color};">
              ${svgHtml}
            </div>
          `;

          const marker = L.marker([e.lat, e.lon], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: iconHtml,
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            })
          }).addTo(lMap);
          marker.on('click', () => setSelectedEvent(e));
        }
      });
    }
  }, 300), [useLeaflet, categoryIcons]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (useLeaflet) return;
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      const mbMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [10, 30],
        zoom: 1.5,
        attributionControl: false,
      });

      mbMap.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

      mbMap.on('load', () => {
        mbMap.addSource('events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

        mbMap.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'events',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#0ea5e9', 100, '#f59e0b', 750, '#f43f5e'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
            'circle-opacity': 0.6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        mbMap.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'events',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12, 'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'] },
          paint: { 'text-color': '#ffffff' }
        });

        // Click on cluster
        mbMap.on('click', 'clusters', (e) => {
          const features = mbMap.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = features[0].properties?.cluster_id;
          (mbMap.getSource('events') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            mbMap.easeTo({ center: (features[0].geometry as any).coordinates, zoom: zoom });
          });
        });

        updateMapData(filteredEvents);
      });

      map.current = mbMap;
    } catch (e) {
      setUseLeaflet(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [useLeaflet]);

  useEffect(() => {
    if (!useLeaflet || !mapContainer.current || leafletMap.current) return;

    try {
      const lMap = L.map(mapContainer.current).setView([30, 10], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(lMap);
      leafletMap.current = lMap;
      updateMapData(filteredEvents);

      return () => {
        leafletMap.current?.remove();
        leafletMap.current = null;
      };
    } catch (e) {
      console.error("Error initializing Leaflet", e);
    }
  }, [useLeaflet]);

  useEffect(() => {
    updateMapData(filteredEvents, selectedEvent?.id);
  }, [filteredEvents, selectedEvent?.id, updateMapData]);

  // Handle Map Centering on Selection
  useEffect(() => {
    if (selectedEvent && selectedEvent.lat !== undefined && selectedEvent.lon !== undefined) {
      if (!useLeaflet && map.current) {
        map.current.easeTo({ center: [selectedEvent.lon, selectedEvent.lat], essential: true });
      } else if (useLeaflet && leafletMap.current) {
        leafletMap.current.panTo([selectedEvent.lat, selectedEvent.lon]);
      }
    }
  }, [selectedEvent, useLeaflet]);

  const toggleCategory = (key: string) => setSelectedCategories(p => ({ ...p, [key]: !p[key] }));
  const toggleSeverity = (key: string) => setSelectedSeverities(p => ({ ...p, [key]: !p[key] }));
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const switchStyle = (style: string) => {
    setActiveLayer(style);
    if (!useLeaflet && map.current) {
      const styleUrl = style === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : style === 'light' ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/satellite-v9';
      map.current.setStyle(styleUrl);
    } else if (useLeaflet && leafletMap.current) {
      leafletMap.current.eachLayer(l => { if (l instanceof L.TileLayer) leafletMap.current?.removeLayer(l); });
      const url = style === 'light' ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      L.tileLayer(url, { subdomains: 'abcd', maxZoom: 19 }).addTo(leafletMap.current);
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-900 overflow-hidden flex flex-col">
      <div ref={mapContainer} className="absolute inset-0 z-0 h-full w-full" />

      <FlashAlert event={alertEvent} onClose={() => setAlertEvent(null)} />
      {selectedEvent && <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <div className={`absolute top-4 ltr:left-4 rtl:right-4 z-20 flex flex-col gap-2 transition-all duration-300 ${isLayersPanelOpen ? 'w-64' : 'w-10'}`}>
        <Card className="bg-slate-900/90 text-white border-slate-700 backdrop-blur overflow-hidden" noPadding>
          <div
            className="p-3 flex items-center justify-between cursor-pointer bg-slate-800/50 hover:bg-slate-800"
            onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-400" />
              {isLayersPanelOpen && <span className="text-xs font-bold uppercase tracking-wider">{t.layers_panel}</span>}
            </div>
            {isLayersPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>

          {isLayersPanelOpen && (
            <div className="p-3 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-2 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> {t.categories}
                </h4>
                <div className="space-y-1">
                  {Object.keys(selectedCategories).map(cat => (
                    <label key={cat} className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 rounded group">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories[cat]}
                          onChange={() => toggleCategory(cat)}
                          className="rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500/50"
                        />
                        <span className="text-xs text-slate-300 capitalize">{t[`cat_${cat}`] || cat}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-primary-400 transition-colors">
                        ({categoryCounts[cat] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.time_range}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['1h', '24h', '7d', 'all'].map(tr => (
                    <button
                      key={tr}
                      onClick={() => setTimeRange(tr)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${timeRange === tr
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                    >
                      {t[`time_${tr}`] || tr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {t.severity}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(selectedSeverities).map(sev => (
                    <button
                      key={sev}
                      onClick={() => toggleSeverity(sev)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border transition-all ${selectedSeverities[sev]
                        ? sev === 'critical' ? 'bg-rose-900/50 border-rose-500 text-rose-200'
                          : sev === 'high' ? 'bg-orange-900/50 border-orange-500 text-orange-200'
                            : sev === 'medium' ? 'bg-amber-900/50 border-amber-500 text-amber-200'
                              : 'bg-emerald-900/50 border-emerald-500 text-emerald-200'
                        : 'bg-transparent border-slate-700 text-slate-600 opacity-50'
                        }`}
                    >
                      {t[sev] || sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Visible Events:</span>
                  <span className="font-mono text-white">{filteredEvents.length}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10 flex flex-col gap-2">
        <Card className="p-1 space-y-1 bg-white/90 backdrop-blur" noPadding>
          <Button variant={activeLayer === 'dark' ? 'primary' : 'ghost'} size="icon" onClick={() => switchStyle('dark')}>
            <MapIcon className="w-4 h-4" />
          </Button>
          <Button variant={activeLayer === 'light' ? 'primary' : 'ghost'} size="icon" onClick={() => switchStyle('light')}>
            <Zap className="w-4 h-4" />
          </Button>
          <Button variant={activeLayer === 'satellite' ? 'primary' : 'ghost'} size="icon" onClick={() => switchStyle('satellite')}>
            <Layers className="w-4 h-4" />
          </Button>
        </Card>
        <Card className="p-1 mt-2 bg-white/90 backdrop-blur" noPadding>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </Card>
      </div>

      <div className={`absolute top-4 z-20 transition-all duration-300 ${isLayersPanelOpen ? 'ltr:left-[272px] rtl:right-[272px]' : 'ltr:left-[56px] rtl:right-[56px]'}`}>
        <div className="bg-primary-600 text-white backdrop-blur border border-primary-500 rounded-xl w-14 h-14 shadow-[0_0_20px_rgba(14,165,233,0.4)] flex flex-col items-center justify-center hover:bg-primary-700 transition-all transform hover:scale-105 active:scale-95 cursor-default group">
          <span className="text-[20px] font-black font-mono leading-none">
            {filteredEvents.length}
          </span>
          <span className="text-[9px] uppercase font-black tracking-tight opacity-80 group-hover:opacity-100">
            {language === 'ar' ? 'حدث' : 'EVENTS'}
          </span>
        </div>
      </div>

      {latestEvent && (
        <div className="latest-timer absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
          <div
            onClick={() => setSelectedEvent(latestEvent)}
            className={`cursor-pointer group flex items-center gap-3 backdrop-blur-md rounded-2xl border bg-slate-900/80 px-4 py-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg`}
            style={{
              borderColor: `${(SEVERITY_COLORS as any)[latestEvent.severity]}55`,
              boxShadow: `0 0 15px ${(SEVERITY_COLORS as any)[latestEvent.severity]}33`
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 group-hover:text-slate-300">
                {t.time_since_last_event}
              </span>
              <span className="text-xl font-bold font-mono tracking-widest text-white group-hover:text-primary-400 transition-colors" style={{ color: (SEVERITY_COLORS as any)[latestEvent.severity] }}>
                {timeSinceLast}
              </span>
            </div>
            {/* Pulsing indicator matching severity */}
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: (SEVERITY_COLORS as any)[latestEvent.severity] }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: (SEVERITY_COLORS as any)[latestEvent.severity] }}></span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <LiveTicker events={filteredEvents} onEventClick={setSelectedEvent} />
      </div>
    </div>
  );
};

export default MapDashboard;