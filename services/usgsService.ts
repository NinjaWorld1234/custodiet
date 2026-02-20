import { UnifiedEvent } from '../types';
import sourcesConfig from './sources.json';
import { DataSource } from './sourceConfig';

const USGS_SOURCE_ID = 'natural_earthquakes_usgs_earthquakes_all_past_hour';

export const fetchUSGSEarthquakes = async (): Promise<UnifiedEvent[]> => {
    try {
        const config = (sourcesConfig.selected_sources as DataSource[]).find(s => s.source_id === USGS_SOURCE_ID);

        if (!config) {
            console.error(`Source configuration not found for ID: ${USGS_SOURCE_ID}`);
            return [];
        }

        const response = await fetch(config.endpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch USGS data: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.features || !Array.isArray(data.features)) {
            throw new Error('Invalid USGS data format: features array missing');
        }

        return data.features.map((feature: any) => {
            const props = feature.properties;
            const geometry = feature.geometry;
            const magnitude = props.mag || 0;

            // Map magnitude to severity
            let severity: UnifiedEvent['severity'] = 'low';
            if (magnitude >= 6) severity = 'critical';
            else if (magnitude >= 4.5) severity = 'high';
            else if (magnitude >= 2.5) severity = 'medium';

            return {
                id: feature.id || `usgs-${Date.now()}-${Math.random()}`,
                source: 'USGS',
                category: 'natural', // maps to our SourceCategory 'natural'
                severity,
                confidence: 1.0, // Source is Tier A
                title: props.title || `Earthquake M${magnitude}`,
                summary: `Magnitude ${magnitude} earthquake. Depth: ${geometry.coordinates[2]}km. Location: ${props.place}.`,
                time: new Date(props.time).toISOString(),
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
                tags: ['earthquake', 'realtime', 'usgs', 'natural_disaster'],
                url: props.url || props.detail
            } as UnifiedEvent;
        });

    } catch (error) {
        console.error('Error fetching USGS Earthquakes:', error);
        return [];
    }
};
