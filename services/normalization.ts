
import { UnifiedEvent } from '../types';

// --- Mock Raw Data Interfaces ---
interface RawSyslog {
  msgId: string;
  priority: number; // 0-7
  timestamp: string;
  hostname: string;
  message: string;
  app: string;
  meta: {
    ip: string;
    geo?: { lat: number; long: number; country: string };
  };
}

interface RawSocialPost {
  id: string;
  created_at: string;
  content: string;
  author: string;
  platform: 'twitter' | 'telegram';
  coordinates?: { lat: number; lng: number };
  hashtags: string[];
  url: string;
  inferred_category?: string;
  country?: string;
}

interface RawThreatIntel {
  uuid: string;
  threat_level: string; // 'SEVERE', 'HIGH', 'MODERATE'
  description: string;
  indicator: string;
  detected_at: string;
  sector: string;
  type?: 'malware' | 'terrorism' | 'conflict';
  geo?: { lat: number; lon: number; country: string };
}

interface RawACLED {
  event_id_cnty: string;
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  location: string;
  latitude: string;
  longitude: string;
  fatalities: string;
  notes: string;
  source: string;
}

// --- Mappers ---

export const mapSyslogToEvent = (log: RawSyslog): UnifiedEvent => {
  // Map Syslog severity (0-7) to our schema
  const getSeverity = (p: number): UnifiedEvent['severity'] => {
    if (p <= 2) return 'critical';
    if (p <= 4) return 'high';
    if (p === 5) return 'medium';
    return 'low';
  };

  return {
    id: `sys-${log.msgId}`,
    source: log.hostname,
    category: 'infrastructure',
    severity: getSeverity(log.priority),
    confidence: 1.0,
    title: `${log.app}: ${log.message.substring(0, 60)}${log.message.length > 60 ? '...' : ''}`,
    summary: log.message,
    time: log.timestamp,
    lat: log.meta.geo?.lat,
    lon: log.meta.geo?.long,
    country: log.meta.geo?.country,
    tags: ['syslog', log.app, log.meta.ip],
    rawPayload: log
  };
};

export const mapSocialToEvent = (post: RawSocialPost): UnifiedEvent => {
  // Simple heuristic for demo purposes
  let cat = 'protests';
  if (post.hashtags.includes('quake') || post.hashtags.includes('flood')) cat = 'natural';
  else if (post.hashtags.includes('virus') || post.hashtags.includes('health')) cat = 'health';
  else if (post.hashtags.includes('war') || post.hashtags.includes('conflict')) cat = 'conflicts';

  return {
    id: `soc-${post.id}`,
    source: post.platform,
    category: post.inferred_category || cat,
    severity: 'medium',
    confidence: 0.6,
    title: `@${post.author}: ${post.content.substring(0, 50)}...`,
    summary: post.content,
    time: post.created_at,
    lat: post.coordinates?.lat,
    lon: post.coordinates?.lng,
    country: post.country,
    tags: [...post.hashtags, 'osint'],
    url: post.url,
    rawPayload: post
  };
};

export const mapThreatIntelToEvent = (intel: RawThreatIntel): UnifiedEvent => {
  const severityMap: Record<string, UnifiedEvent['severity']> = {
    'SEVERE': 'critical',
    'HIGH': 'high',
    'MODERATE': 'medium',
    'LOW': 'low'
  };

  let cat = 'cyber';
  if (intel.type === 'terrorism') cat = 'terrorism';
  if (intel.type === 'conflict') cat = 'conflicts';

  return {
    id: `ti-${intel.uuid}`,
    source: 'Global Threat Feed',
    category: cat,
    severity: severityMap[intel.threat_level] || 'medium',
    confidence: 0.85,
    title: `Intel: ${intel.indicator || intel.type}`,
    summary: `${intel.description} impacting ${intel.sector} sector.`,
    time: intel.detected_at,
    lat: intel.geo?.lat,
    lon: intel.geo?.lon,
    country: intel.geo?.country,
    tags: ['threat-intel', intel.sector, 'ioc'],
    rawPayload: intel
  };
};

export const mapACLEDToEvent = (item: RawACLED): UnifiedEvent => {
  const isProtest = item.event_type.toLowerCase().includes('protest');
  const fatalities = parseInt(item.fatalities || '0', 10);

  let severity: UnifiedEvent['severity'] = 'low';
  if (fatalities > 10) severity = 'critical';
  else if (fatalities > 0) severity = 'high';
  else if (isProtest) severity = 'medium';

  // Make mock dates relative to now if they are just YYYY-MM-DD
  const date = new Date(item.event_date);
  if (date.getHours() === 0) {
    const now = new Date();
    date.setHours(now.getHours(), now.getMinutes());
  }

  return {
    id: `acled-${item.event_id_cnty}`,
    source: 'ACLED',
    category: isProtest ? 'protests' : 'conflicts',
    severity,
    confidence: 0.9,
    title: `${item.event_type} in ${item.location}`,
    summary: item.notes || `Reported ${item.sub_event_type}.`,
    time: date.toISOString(),
    lat: parseFloat(item.latitude),
    lon: parseFloat(item.longitude),
    country: item.location,
    tags: [item.actor1, item.sub_event_type, 'acled'],
    url: 'https://acleddata.com',
    rawPayload: item
  };
};

// --- Generic Factory ---
export const normalizeEvent = (data: any, type: 'syslog' | 'social' | 'intel' | 'acled'): UnifiedEvent => {
  switch (type) {
    case 'syslog': return mapSyslogToEvent(data);
    case 'social': return mapSocialToEvent(data);
    case 'intel': return mapThreatIntelToEvent(data);
    case 'acled': return mapACLEDToEvent(data);
    default: throw new Error(`Unknown event type: ${type}`);
  }
};