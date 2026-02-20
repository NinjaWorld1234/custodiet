
import { UnifiedEvent, Metric } from '../types';
import { DATA_SOURCES, SourceConfig } from './sourcesConfig';
import { BaseCollector } from './collectors/base';
import { USGSEarthquakeCollector, GDACSCollector, NASAEONETCollector, NOAAWeatherCollector } from './collectors/naturalDisaster';
import { GDELTCollector, ACLEDCollector } from './collectors/conflict';
import { IODACollector, SubmarineCableCollector } from './collectors/infrastructure';
import { WHOCollector, ProMEDCollector } from './collectors/health';
import { NOAASpaceCollector } from './collectors/space';
import { analyzeEventImpact } from './analysisService';

// Factory to get collector instance
const getCollector = (config: SourceConfig): BaseCollector | null => {
    switch (config.id) {
        case 'usgs_earthquake': return new USGSEarthquakeCollector(config);
        case 'gdacs_disaster': return new GDACSCollector(config);
        case 'nasa_eonet': return new NASAEONETCollector(config);
        case 'noaa_weather': return new NOAAWeatherCollector(config);

        case 'gdelt_project': return new GDELTCollector(config);
        case 'acled_conflict': return new ACLEDCollector(config);

        case 'ioda_outages': return new IODACollector(config);
        case 'submarine_cables': return new SubmarineCableCollector(config);

        case 'who_don': return new WHOCollector(config);
        case 'promed_mail': return new ProMEDCollector(config);

        case 'noaa_space': return new NOAASpaceCollector(config);

        default: return null;
    }
};

export const fetchAllEvents = async (): Promise<UnifiedEvent[]> => {
    const enabledSources = DATA_SOURCES.filter(s => s.enabled);

    // Execute all fetches in parallel
    const promises = enabledSources.map(async (config) => {
        const collector = getCollector(config);
        if (!collector) return [];

        const result = await collector.fetch();
        if (result.error) {
            console.warn(`[DataService] Source ${config.name} failed:`, result.error);
            return [];
        }
        return result.events;
    });

    const results = await Promise.allSettled(promises);

    const allEvents: UnifiedEvent[] = [];
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            allEvents.push(...result.value);
        }
    });


    // Run Fusion Analysis on critical/high events
    const analyzedEvents = await Promise.all(allEvents.map(async (event) => {
        if (event.lat && event.lon && (event.severity === 'critical' || event.severity === 'high')) {
            try {
                // analyzeEventImpact returns the enriched UnifiedEvent
                return await analyzeEventImpact(event);
            } catch (e) {
                return event; // Fail gracefully
            }
        }
        return event;
    }));

    // Sort by time descending
    return analyzedEvents.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

export const fetchMetricStats = async (): Promise<Metric[]> => {
    // Simple mock stats for now
    return [
        { id: '1', label: 'Active Sources', value: DATA_SOURCES.filter(s => s.enabled).length, change: 0, trend: 'neutral' },
        { id: '2', label: 'Alerts Today', value: '12', change: 5, trend: 'up' }
    ];
};
