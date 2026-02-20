
import { UnifiedEvent } from '../types';
import { normalizeEvent } from './normalization';

// --- API Endpoints ---
const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const NASA_EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20';

// --- GDACS RSS Proxy (using rss2json for client-side demo) ---
// Note: In production, parse XML on server-side to avoid CORS/Rate-limits
const GDACS_FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.gdacs.org/xml/rss.xml';

/**
 * Fetch Real-Time Earthquakes from USGS
 */
export const fetchUSGSEarthquakes = async (): Promise<UnifiedEvent[]> => {
    try {
        const response = await fetch(USGS_FEED_URL);
        if (!response.ok) throw new Error('Failed to fetch USGS data');

        const data = await response.json();

        return data.features.map((feature: any) => ({
            id: feature.id,
            source: 'USGS',
            category: 'natural',
            severity: feature.properties.mag >= 6 ? 'critical' : feature.properties.mag >= 4.5 ? 'high' : 'medium',
            confidence: 1.0,
            title: feature.properties.title,
            summary: `Depth: ${feature.geometry.coordinates[2]}km. Magnitude: ${feature.properties.mag}.`,
            time: new Date(feature.properties.time).toISOString(),
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            country: feature.properties.place?.split(',').pop()?.trim(), // Extract "Oklahoma", "CA", "Japan"
            tags: ['earthquake', 'realtime'],
            url: feature.properties.url
        }));
    } catch (error) {
        console.error('USGS Fetch Error:', error);
        return [];
    }
};

/**
 * Fetch Real-Time Disasters from GDACS (via RSS Proxy)
 */
export const fetchGDACSAlerts = async (): Promise<UnifiedEvent[]> => {
    try {
        const response = await fetch(GDACS_FEED_URL);
        if (!response.ok) throw new Error('Failed to fetch GDACS data');

        const data = await response.json();

        if (data.status !== 'ok') return [];

        return data.items.map((item: any) => {
            // Simple heuristic for severity based on title content
            const isCritical = item.title.includes('Red') || item.title.includes('High');
            const isHigh = item.title.includes('Orange') || item.title.includes('Medium');

            return {
                id: item.guid || Math.random().toString(36),
                source: 'GDACS',
                category: 'natural', // GDACS mostly covers natural disasters
                severity: isCritical ? 'critical' : isHigh ? 'high' : 'medium',
                confidence: 0.9,
                title: item.title,
                summary: item.description,
                time: new Date(item.pubDate).toISOString(),
                // RSS2JSON tries to parse geo tags, or we might need to extract from description if missing
                // For this demo, we'll try to use what's available or fallback
                lat: 0, // GDACS RSS often needs XML parsing for proper geo, this is a simplified attempt
                lon: 0,
                tags: ['disaster', 'realtime', 'gdacs'],
                url: item.link
            } as UnifiedEvent;
        }).filter((e: UnifiedEvent) => e.title); // Filter out empty
    } catch (error) {
        console.error('GDACS Fetch Error:', error);
        return [];
    }
};

/**
 * Fetch Real-Time NASA EONET Data
 */
export const fetchNASAEONET = async (): Promise<UnifiedEvent[]> => {
    try {
        const response = await fetch(NASA_EONET_URL);
        if (!response.ok) throw new Error('Failed to fetch NASA EONET');
        const data = await response.json();

        return data.events.map((event: any) => {
            const geometry = event.geometry[0]; // Take the latest geometry
            return {
                id: event.id,
                source: 'NASA EONET',
                category: 'natural',
                severity: 'medium', // EONET doesn't always provide severity, default to medium
                confidence: 1.0,
                title: event.title,
                summary: event.description || `Event detected by NASA EONET. Category: ${event.categories[0]?.title}`,
                time: geometry.date,
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
                tags: ['nasa', 'satellite', 'realtime'],
                url: event.link
            };
        });
    } catch (e) {
        console.error("NASA EONET Error:", e);
        return [];
    }
}
