
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UnifiedEvent } from '../types'; // Assumes types.ts is in project root
import { getCache, setCache } from './lib/cache';

// --- Connectors ---

// 1. Mock Internal Syslog
const fetchSyslogData = async () => {
  return [
    {
      msgId: `sys-${Date.now()}`,
      priority: 1,
      timestamp: new Date().toISOString(),
      hostname: 'gateway-firewall-01',
      message: 'Blocked inbound connection from blacklisted IP range.',
      app: 'iptables',
      meta: { ip: '203.0.113.42', geo: { lat: 35.6895, long: 139.6917, country: 'JP' } }
    }
  ];
};

// 2. Mock Social Media
const fetchSocialData = async () => {
  return [
    {
      id: `tw-${Date.now()}`,
      created_at: new Date().toISOString(),
      content: 'Reports of massive data leak in retail sector growing. #databreach',
      author: 'CyberWatchDog',
      platform: 'twitter',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      hashtags: ['databreach', 'retail'],
      url: 'https://twitter.com/example'
    }
  ];
};

// 3. USGS Earthquake Hazards Program (Real External API)
const fetchUSGSData = async () => {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
    if (!response.ok) return [];
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Failed to fetch USGS data:', error);
    return [];
  }
};

// 4. ACLED (Armed Conflict Location & Event Data Project)
const fetchACLEDData = async () => {
  const API_KEY = process.env.ACLED_KEY;
  const EMAIL = process.env.ACLED_EMAIL;

  if (API_KEY && EMAIL) {
    try {
      const url = `https://api.acleddata.com/acled/read?key=${API_KEY}&email=${EMAIL}&limit=20`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error('ACLED fetch failed', e);
    }
  }
  // Fallback Sample
  const today = new Date().toISOString().split('T')[0];
  return [
    { event_id_cnty: 'DEMO-ACLED-1', event_date: today, event_type: 'Protests', sub_event_type: 'Peaceful protest', actor1: 'Protesters (Germany)', location: 'Berlin', latitude: '52.5200', longitude: '13.4050', fatalities: '0', notes: 'Hundreds gathered at Brandenburg Gate.', source: 'Local Media' },
    { event_id_cnty: 'DEMO-ACLED-2', event_date: today, event_type: 'Battles', sub_event_type: 'Armed clash', actor1: 'Military Forces', location: 'Border Zone A', latitude: '33.5', longitude: '36.3', fatalities: '15', notes: 'Heavy exchange of fire.', source: 'International Wire' }
  ];
};

// 5. Global Crisis & News Stubs (GDELT, CrisisWatch, Event Registry, GTTAC)
const fetchGlobalCrisis = async () => {
  const sources = [];
  
  // Stub: GDELT (Project)
  if (process.env.GDELT_ENABLED) { /* fetch logic */ } 
  else {
      // Mock GDELT
      sources.push({ source: 'GDELT', title: 'Diplomatic tension rising in Eastern Europe', category: 'geopolitical', lat: 50.45, lon: 30.52 });
  }

  // Stub: CrisisWatch
  if (process.env.CRISISWATCH_KEY) { /* fetch */ }

  // Stub: GTTAC (Terrorism)
  if (process.env.GTTAC_KEY) { /* fetch */ }

  return sources;
};

// 6. Cyber Intelligence Stubs (AlienVault, Abuse.ch, VT, Shodan, MISP, CIRCL)
const fetchCyberIntell = async () => {
  const sources = [];

  // Stub: AlienVault OTX
  if (process.env.OTX_KEY) { /* fetch https://otx.alienvault.com/api/v1/indicators/export */ }
  else {
      sources.push({ source: 'AlienVault OTX', title: 'New IoC detected: APT29 Infrastructure', category: 'cyber', severity: 'high', tags: ['apt29', 'ioc'] });
  }

  // Stub: Abuse.ch (URLhaus)
  if (process.env.URLHAUS_ENABLED) { /* fetch https://urlhaus-api.abuse.ch/v1/urls/recent/ */ }

  // Stub: Shodan (Exposed Devices)
  if (process.env.SHODAN_KEY) { /* fetch https://api.shodan.io/shodan/host/search */ }

  // Stub: MISP
  if (process.env.MISP_URL && process.env.MISP_KEY) { /* fetch */ }

  return sources;
};

// 7. Health & Environment Stubs (NOAA, NASA, WHO, CDC)
const fetchHealthEnv = async () => {
  const sources: any[] = [];

  // Stub: NOAA
  if (process.env.NOAA_TOKEN) { /* fetch */ }
  
  // Stub: NASA EONET
  try {
     const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?limit=2&status=open');
     if (res.ok) {
         const data = await res.json();
         // Push simplified data
         if (data.events && Array.isArray(data.events)) {
            data.events.forEach((e: any) => {
                if (e.geometry && e.geometry[0] && e.geometry[0].coordinates) {
                    sources.push({
                        source: 'NASA EONET',
                        title: e.title,
                        category: 'natural',
                        lat: e.geometry[0].coordinates[1],
                        lon: e.geometry[0].coordinates[0],
                        severity: 'medium'
                    });
                }
            });
         }
     }
  } catch (e) { /* ignore */ }

  // Stub: WHO/CDC
  if (process.env.WHO_FEED_ENABLED) { /* fetch RSS */ }

  return sources;
};


// --- Normalizers ---

const normalizeData = (rawData: any[]): UnifiedEvent[] => {
  return rawData.map(item => ({
    id: item.msgId || item.id,
    source: item.hostname || item.platform,
    category: item.msgId ? 'infrastructure' : 'social',
    severity: 'medium',
    confidence: 0.8,
    title: item.message || item.content,
    summary: item.message || item.content,
    time: item.timestamp || item.created_at,
    lat: item.meta?.geo?.lat || item.coordinates?.lat,
    lon: item.meta?.geo?.long || item.coordinates?.lng,
    tags: item.hashtags || ['log'],
    rawPayload: item
  } as UnifiedEvent));
};

const normalizeUSGS = (features: any[]): UnifiedEvent[] => {
  return features.map(f => {
    const props = f.properties;
    const mag = props.mag || 0;
    const coords = f.geometry?.coordinates;
    let severity: UnifiedEvent['severity'] = 'low';
    if (mag >= 6.0) severity = 'critical';
    else if (mag >= 4.5) severity = 'high';
    else if (mag >= 3.0) severity = 'medium';

    return {
      id: `usgs-${f.id}`,
      source: 'USGS',
      category: 'natural',
      severity,
      confidence: 1.0,
      title: `M ${mag.toFixed(1)} Earthquake - ${props.place}`,
      summary: `Magnitude ${mag} earthquake detected. Depth: ${coords ? coords[2] : 0}km.`,
      time: new Date(props.time).toISOString(),
      lat: coords ? coords[1] : 0,
      lon: coords ? coords[0] : 0,
      tags: ['earthquake', 'usgs'],
      url: props.url,
      rawPayload: f
    };
  });
};

const normalizeACLED = (data: any[]): UnifiedEvent[] => {
  return data.map(item => {
    const isProtest = item.event_type.toLowerCase().includes('protest');
    const fatalities = parseInt(item.fatalities || '0', 10);
    let severity: UnifiedEvent['severity'] = 'low';
    if (fatalities > 10) severity = 'critical';
    else if (fatalities > 0) severity = 'high';
    else if (isProtest) severity = 'medium';

    const date = new Date(item.event_date);
    const now = new Date();
    date.setHours(now.getHours(), now.getMinutes());

    return {
      id: `acled-${item.event_id_cnty}`,
      source: 'ACLED',
      category: isProtest ? 'protests' : 'conflicts',
      severity,
      confidence: 0.9,
      title: `${item.event_type} in ${item.location}`,
      summary: item.notes,
      time: date.toISOString(),
      lat: parseFloat(item.latitude),
      lon: parseFloat(item.longitude),
      tags: [item.actor1, 'acled'],
      url: 'https://acleddata.com',
      rawPayload: item
    };
  });
};

const normalizeStubs = (data: any[]): UnifiedEvent[] => {
  return data.map((item, idx) => ({
    id: `stub-${item.source}-${idx}-${Date.now()}`,
    source: item.source,
    category: item.category || 'general',
    severity: item.severity || 'medium',
    confidence: 0.7,
    title: item.title,
    summary: item.title,
    time: new Date().toISOString(),
    lat: item.lat,
    lon: item.lon,
    tags: item.tags || [],
    rawPayload: item
  }));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const CACHE_KEY = 'events_agg_v4';
  const cachedData = getCache<UnifiedEvent[]>(CACHE_KEY);
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cachedData);
  }

  try {
    const [syslog, social, usgs, acled, globalCrisis, cyber, health] = await Promise.all([
      fetchSyslogData(),
      fetchSocialData(),
      fetchUSGSData(),
      fetchACLEDData(),
      fetchGlobalCrisis(),
      fetchCyberIntell(),
      fetchHealthEnv()
    ]);

    const events = [
      ...normalizeData(syslog),
      ...normalizeData(social),
      ...normalizeUSGS(usgs),
      ...normalizeACLED(acled),
      ...normalizeStubs(globalCrisis),
      ...normalizeStubs(cyber),
      ...normalizeStubs(health)
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setCache(CACHE_KEY, events, 60);
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(events);

  } catch (error) {
    console.error('Gateway Error:', error);
    return res.status(502).json({ error: 'Upstream service unavailable' });
  }
}
