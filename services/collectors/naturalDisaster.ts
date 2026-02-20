
import { BaseCollector, CollectorResult } from './base';
import { UnifiedEvent } from '../../types';

// --- USGS Earthquake Collector ---
export class USGSEarthquakeCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchJson(this.config.apiUrl);

            const events = data.features.map((feature: any) => {
                const mag = feature.properties.mag;
                let severity: UnifiedEvent['severity'] = 'low';
                if (mag >= 6) severity = 'critical';
                else if (mag >= 4.5) severity = 'high';
                else if (mag >= 3) severity = 'medium';

                return this.normalize(feature, {
                    id: feature.id,
                    title: feature.properties.title,
                    summary: `Magnitude ${mag} earthquake. Depth: ${feature.geometry.coordinates[2]}km.`,
                    time: new Date(feature.properties.time).toISOString(),
                    lat: feature.geometry.coordinates[1],
                    lon: feature.geometry.coordinates[0],
                    severity,
                    tags: ['earthquake', 'seismic'],
                    confidence: 1.0,
                    url: feature.properties.url
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- GDACS Collector (RSS) ---
export class GDACSCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchRss(this.config.apiUrl);
            if (data.status !== 'ok') throw new Error('GDACS RSS feed invalid');

            const events = data.items.map((item: any) => {
                // Heuristics for severity
                const isRed = item.title.includes('Red') || item.description?.includes('Red');
                const isOrange = item.title.includes('Orange') || item.description?.includes('Orange');

                let severity: UnifiedEvent['severity'] = 'medium';
                if (isRed) severity = 'critical';
                else if (isOrange) severity = 'high';

                // Attempt to parse lat/lon if available in description or extract from georss if proxy provides
                // RSS2JSON often puts geo data in 'enclosure' or custom fields if configured, 
                // but standard items might lack it unless we parse description.
                // For this demo, we'll try to rely on simple mapping if possible, else 0,0

                return this.normalize(item, {
                    id: item.guid,
                    title: item.title,
                    summary: item.description,
                    time: item.pubDate,
                    severity,
                    lat: 0, // Improvement: Parse "lat: x, lon: y" from description if possible
                    lon: 0,
                    tags: ['disaster', 'gdacs'],
                    confidence: 0.9,
                    url: item.link
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- NASA EONET Collector ---
export class NASAEONETCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchJson(this.config.apiUrl);

            const events = (data.events || []).map((event: any) => {
                const geo = event.geometry[0]; // Take latest
                return this.normalize(event, {
                    id: event.id,
                    title: event.title,
                    summary: event.description || `Event detected by NASA EONET (${event.categories[0]?.title})`,
                    time: geo.date,
                    lat: geo.coordinates[1],
                    lon: geo.coordinates[0],
                    severity: 'medium', // EONET lacks explicit severity
                    tags: ['nasa', 'satellite', event.categories[0]?.id],
                    confidence: 1.0,
                    url: event.link
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- NOAA Weather Collector ---
export class NOAAWeatherCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchJson(this.config.apiUrl);

            const events = (data.features || []).map((feature: any) => {
                const props = feature.properties;
                let severity: UnifiedEvent['severity'] = 'low';
                if (props.severity === 'Severe') severity = 'high';
                if (props.severity === 'Extreme') severity = 'critical';
                if (props.severity === 'Moderate') severity = 'medium';

                // NOAA polygons are complex, we'll take the first point of polygon or centroid if possible
                // For simplicity, we might not have a single point. 
                // We'll try to find a centroid if geometry is Polygon
                let lat = 0, lon = 0;
                if (feature.geometry?.type === 'Polygon') {
                    // Simple approximation: first point
                    lon = feature.geometry.coordinates[0][0][0];
                    lat = feature.geometry.coordinates[0][0][1];
                }

                return this.normalize(feature, {
                    id: props.id,
                    title: props.headline || props.event,
                    summary: props.description,
                    time: props.sent || props.effective,
                    severity,
                    lat,
                    lon,
                    tags: ['weather', 'noaa', props.event],
                    confidence: 0.95,
                    url: props.instruction // or other link
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}
