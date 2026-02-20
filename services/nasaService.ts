import { UnifiedEvent } from '../types';
import sourcesConfig from './sources.json';
import { DataSource } from './sourceConfig';

const EONET_ID = 'natural_multi_hazards_nasa_eonet_events';

export const fetchNasaEonetEvents = async (): Promise<UnifiedEvent[]> => {
    try {
        const config = (sourcesConfig.selected_sources as DataSource[]).find(s => s.source_id === EONET_ID);
        if (!config) return [];

        // Append standard parameters for open active events
        const response = await fetch(`${config.endpoint}?status=open&limit=20`);
        if (!response.ok) throw new Error('NASA EONET Fetch Failed');

        const data = await response.json();
        const events = data.events || [];

        return events.map((event: any) => {
            const geometry = event.geometry[0];
            const category = event.categories[0];

            return {
                id: event.id,
                source: 'NASA EONET',
                category: 'natural',
                severity: 'medium', // EONET doesn't provide severity, assume meaningful if tracked by NASA
                confidence: 1.0,
                title: event.title,
                summary: `Event type: ${category?.title || 'Unknown'}. Status: Closed? ${event.closed ? 'Yes' : 'No'}.`,
                time: geometry.date,
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
                tags: ['nasa', 'natural_disaster', category?.id],
                url: event.link
            };
        });

    } catch (error) {
        console.error('NASA EONET Error:', error);
        return [];
    }
};
