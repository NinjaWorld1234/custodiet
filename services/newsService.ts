import { UnifiedEvent } from '../types';
import sourcesConfig from './sources.json';
import { DataSource } from './sourceConfig';

const GDELT_ID = 'geopolitics_news_event_mining_gdelt_apis_base';

// Simple local sentiment analysis for MVP (since GDELT Geo API doesn't return tone directly)
const analyzeSentiment = (text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } => {
    const negatives = ['dead', 'kill', 'attack', 'crisis', 'war', 'conflict', 'riot', 'protest', 'bomb', 'explosion', 'disaster', 'death', 'injured', 'clash'];
    const positives = ['peace', 'treaty', 'agreement', 'rescue', 'aid', 'support', 'rebuild', 'success'];

    const lower = text.toLowerCase();
    let score = 0;

    negatives.forEach(w => { if (lower.includes(w)) score -= 2; });
    positives.forEach(w => { if (lower.includes(w)) score += 1; });

    return {
        score,
        label: score < 0 ? 'negative' : score > 0 ? 'positive' : 'neutral'
    };
};

export const fetchGdeltEvents = async (): Promise<UnifiedEvent[]> => {
    try {
        const config = (sourcesConfig.selected_sources as DataSource[]).find(s => s.source_id === GDELT_ID);
        if (!config) return [];

        // Advanced Query: Targeting Conflict & Instability explicitly
        // We use "sourcelang:eng" to ensure we can parse the text
        const query = '(protest OR riot OR "armed conflict" OR "terror attack" OR "military strike" OR crisis) sourcelang:eng';
        const endpoint = `${config.endpoint}/geo/geo?query=${encodeURIComponent(query)}&mode=PointData&timespan=12h&format=geojson`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('GDELT Fetch Failed');

        const data = await response.json();

        if (!data.features) return [];

        return data.features.slice(0, 50).map((feature: any, index: number) => {
            const props = feature.properties;
            const locationName = props.name || 'Unknown Location';

            // Construct a meaningful title/summary
            // GDELT GeoJSON "name" is often just the city. 
            // We might have to rely on the fact that we queried for conflict.

            const sentiment = analyzeSentiment(locationName); // Analyzing the location name is weak, but often "Riot in X" comes up. 
            // Actually GDELT GeoJSON doesn't give a separate title field easily. 
            // We will label it generally based on the query.

            let severity: UnifiedEvent['severity'] = 'medium';
            if (sentiment.score <= -4) severity = 'high';
            if (sentiment.score <= -6) severity = 'critical';

            return {
                id: `gdelt-${index}-${Date.now()}`,
                source: 'GDELT (Conflict)',
                category: 'geopolitics',
                severity,
                confidence: 0.85,
                title: `Instability Signal: ${locationName}`,
                summary: `Algorithmic detection of potential conflict or unrest. \nSentiment Score: ${sentiment.score}. \nSource Count: ${props.count || 1}.`,
                time: new Date().toISOString(),
                lat: feature.geometry.coordinates[1],
                lon: feature.geometry.coordinates[0],
                tags: ['conflict', 'protest', 'gdelt', sentiment.label],
                url: props.url
            };
        });

    } catch (error) {
        console.error('GDELT Fetch Error:', error);
        return [];
    }
};
