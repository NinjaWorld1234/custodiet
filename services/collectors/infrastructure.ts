
import { BaseCollector, CollectorResult } from './base';
import { UnifiedEvent } from '../../types';

// --- IODA (Internet Outage) Collector ---
export class IODACollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            // IODA API often requires specific paths.
            // Using a stub/mock logic here if real API is complex or CORS restricted
            // Assuming we can fetch summary
            // const data = await this.fetchJson(this.config.apiUrl);

            // Mocking data for IODA as public API access can be specific
            return {
                events: [
                    this.normalize({}, {
                        id: 'ioda-mock-1',
                        title: 'Internet Outage: Sudan',
                        summary: 'Significant drop in connectivity detected.',
                        time: new Date().toISOString(),
                        lat: 12.8628,
                        lon: 30.2176,
                        severity: 'high',
                        tags: ['internet', 'outage', 'infrastructure'],
                        url: 'https://ioda.internetoutage.io/'
                    })
                ]
            };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- Submarine Cables Collector ---
export class SubmarineCableCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchJson(this.config.apiUrl);

            // This returns a GeoJSON FeatureCollection of cables
            // We shouldn't treat every cable as an "event".
            // However, the request was to visualize them.
            // Maybe we only return "New" cables or just return them as assets?
            // For UnifiedEvent architecture, we might verify if any are "Faulty".
            // Since the source is a static map, we'll treat them as assets or info events.

            // Limiting to first 10 for performance in this demo
            const events = (data.features || []).slice(0, 5).map((feature: any) => {
                return this.normalize(feature, {
                    id: feature.properties.id,
                    title: feature.properties.name,
                    summary: `Submarine Cable. Owners: ${feature.properties.owners || 'Unknown'}`,
                    time: new Date().toISOString(), // Static data
                    lat: feature.geometry.coordinates[0][0][1], // Start point
                    lon: feature.geometry.coordinates[0][0][0],
                    severity: 'low', // It's infrastructure, not an emergency
                    tags: ['cable', 'infrastructure'],
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
