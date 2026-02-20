
import { Metric, UnifiedEvent } from '../types';
import { normalizeEvent } from './normalization';
import { getEventsFromGateway } from './gateway';

// Toggle to force mocks in development if API is not running
const USE_GATEWAY = true;

export const fetchMetrics = async (): Promise<Metric[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { id: '1', label: 'Total Requests', value: '2.4M', change: 12.5, trend: 'up' },
    { id: '2', label: 'Avg Latency', value: '45ms', change: -5.2, trend: 'down' },
    { id: '3', label: 'Error Rate', value: '0.02%', change: 0.01, trend: 'neutral' },
    { id: '4', label: 'Active Users', value: '14,203', change: 8.4, trend: 'up' },
  ];
};

// --- MOCK DATA GENERATOR (Fallback) ---
const generateMockEvents = (): UnifiedEvent[] => {
  const now = new Date();

  // 1. Infrastructure (Syslog)
  const rawSyslogs = [
    {
      msgId: '1001',
      priority: 1, // Critical
      timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      hostname: 'firewall-core-01',
      message: 'Detected unauthorized root access attempt via SSH port 22.',
      app: 'sshd',
      meta: { ip: '192.168.1.45', geo: { lat: 52.5200, long: 13.4050, country: 'DE' } }
    },
    {
      msgId: '1002',
      priority: 6, // Info/Low
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(), // > 24h
      hostname: 'lb-service-04',
      message: 'Routine health check passed.',
      app: 'haproxy',
      meta: { ip: '10.0.0.5', geo: { lat: 48.8566, long: 2.3522, country: 'FR' } }
    }
  ];

  // 2. Protests & Natural (Social)
  const rawSocials = [
    {
      id: '99281',
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      content: 'Massive protest gathering near the city square demanding policy changes. #protest #city',
      author: 'activist_01',
      platform: 'twitter' as const,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      hashtags: ['protest', 'civil_unrest'],
      url: 'https://twitter.com/example/status/99281',
      inferred_category: 'protests',
      country: 'USA'
    },
    {
      id: '99283',
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      content: 'New outbreak of viral infection detected in regional hospital. #health #virus',
      author: 'health_monitor',
      platform: 'twitter' as const,
      coordinates: { lat: 19.4326, lng: -99.1332 }, // Mexico City
      hashtags: ['health', 'outbreak'],
      url: 'https://twitter.com/example/status/99283',
      inferred_category: 'health',
      country: 'Mexico'
    }
  ];

  // 3. Cyber & Terrorism (Intel)
  const rawIntel = [
    {
      uuid: 'abc-123',
      threat_level: 'SEVERE',
      description: 'Ransomware "DarkCry" targeting financial institutions.',
      indicator: 'SHA256: 8a4b...',
      detected_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      sector: 'Finance',
      type: 'malware' as const, // -> cyber
      geo: { lat: 51.5074, lon: -0.1278, country: 'UK' }
    },
    {
      uuid: 'def-456',
      threat_level: 'HIGH',
      description: 'Credible intelligence regarding coordinated attacks on transport hubs.',
      indicator: 'Intel-Source-X',
      detected_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
      sector: 'Government',
      type: 'terrorism' as const,
      geo: { lat: 55.7558, lon: 37.6173, country: 'Russia' }
    },
    {
      uuid: 'ghi-789',
      threat_level: 'MODERATE',
      description: 'Border skirmishes reported escalating in the region.',
      indicator: 'Geo-Conflict-Zone',
      detected_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      sector: 'Military',
      type: 'conflict' as const, // -> conflicts
      geo: { lat: 34.5553, lon: 69.2075, country: 'Afghanistan' }
    }
  ];

  // 4. ACLED (Conflicts & Protests)
  const rawACLED = [
    {
      event_id_cnty: 'DEMO-100',
      event_date: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
      event_type: 'Protests',
      sub_event_type: 'Peaceful protest',
      actor1: 'Teachers Union',
      location: 'Madrid',
      latitude: '40.4168',
      longitude: '-3.7038',
      fatalities: '0',
      notes: 'Teachers marching for better wages in city center.',
      source: 'Local News'
    },
    {
      event_id_cnty: 'DEMO-101',
      event_date: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
      event_type: 'Battles',
      sub_event_type: 'Armed clash',
      actor1: 'Insurgents',
      location: 'Remote Outpost',
      latitude: '34.0',
      longitude: '65.0',
      fatalities: '5',
      notes: 'Small arms fire exchange reported.',
      source: 'Wire Service'
    }
  ];

  const events: UnifiedEvent[] = [
    ...rawSyslogs.map(l => normalizeEvent(l, 'syslog')),
    ...rawSocials.map(s => normalizeEvent(s, 'social')),
    ...rawIntel.map(i => normalizeEvent(i, 'intel')),
    ...rawACLED.map(a => normalizeEvent(a, 'acled'))
  ];

  // 5. Natural Disasters (USGS Mock)
  events.push({
    id: 'usgs-mock-1',
    source: 'USGS Earthquake Feed',
    category: 'natural',
    severity: 'high',
    confidence: 1.0,
    title: 'M 4.9 Earthquake - 12km SSW of Santa Clarita, CA',
    summary: 'Magnitude 4.9 earthquake detected. Depth: 14km.',
    time: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    lat: 34.3917,
    lon: -118.5426,
    country: 'California',
    tags: ['earthquake', 'usgs', 'mock'],
    url: 'https://earthquake.usgs.gov',
  });

  events.push({
    id: 'usgs-mock-2',
    source: 'USGS Earthquake Feed',
    category: 'natural',
    severity: 'critical',
    confidence: 1.0,
    title: 'M 6.2 Earthquake - Near Coast of Central Chile',
    summary: 'Magnitude 6.2 earthquake detected. Depth: 25km.',
    time: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    lat: -30.5,
    lon: -71.5,
    country: 'Chile',
    tags: ['earthquake', 'usgs', 'mock'],
    url: 'https://earthquake.usgs.gov',
  });

  // Assign random locations to some events without coordinates for map viz
  const fallbackLocations = [
    { lat: 51.5074, lon: -0.1278, country: 'UK' }, // London
    { lat: -33.8688, lon: 151.2093, country: 'Australia' }, // Sydney
    { lat: 55.7558, lon: 37.6173, country: 'Russia' }, // Moscow
    { lat: 30.0444, lon: 31.2357, country: 'Egypt' } // Cairo
  ];

  return events.map((e, i) => {
    if (!e.lat) {
      const loc = fallbackLocations[i % fallbackLocations.length];
      return { ...e, lat: loc.lat, lon: loc.lon, country: e.country || loc.country };
    }
    return e;
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

// --- HYBRID FETCHER ---
import { enrichEventWithAI } from './aiService';
import { fetchUSGSEarthquakes, fetchGDACSAlerts, fetchNASAEONET } from './realtime';

export const fetchSecurityEvents = async (): Promise<UnifiedEvent[]> => {
  // Try Gateway first (if enabled), then Fallback
  let gatewayEvents: UnifiedEvent[] = [];
  if (USE_GATEWAY) {
    try {
      gatewayEvents = await getEventsFromGateway();
      console.log('Using Gateway Data');
    } catch (e) {
      console.warn('Gateway unavailable, utilizing mixed fallback.');
    }
  }

  // Fetch Real-time Public Data (Parallel)
  const [usgs, gdacs, nasa] = await Promise.allSettled([
    fetchUSGSEarthquakes(),
    fetchGDACSAlerts(),
    fetchNASAEONET()
  ]);

  const realTimeEvents = [
    ...(usgs.status === 'fulfilled' ? usgs.value : []),
    ...(gdacs.status === 'fulfilled' ? gdacs.value : []),
    ...(nasa.status === 'fulfilled' ? nasa.value : [])
  ];

  // Generate Mocks (always needed for scenarios not covered by public APIs, like cyber/intel)
  // const mocks = generateMockEvents(); // DISABLED per user request (only real events)

  // Merge: Prefer Real Data, but keep Mocks for demonstration of other categories
  // In a real app, you might filter mocks if real data is sufficient
  const combined = [...gatewayEvents, ...realTimeEvents];

  // ENRICH WITH AI (Auto-Translation)
  // We run this parallel for all events to ensure they have "translated" field
  const enrichedEvents = await Promise.all(combined.map(async (ev) => {
    try {
      // Verify if already enriched or needs enrichment
      if (!ev.translated) {
        return await enrichEventWithAI(ev);
      }
      return ev;
    } catch (e) {
      return ev;
    }
  }));

  return enrichedEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

export const fetchChartData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    inbound: Math.floor(Math.random() * 5000) + 1000,
    outbound: Math.floor(Math.random() * 3000) + 500,
    blocked: Math.floor(Math.random() * 200),
  }));
};
