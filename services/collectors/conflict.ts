
import { BaseCollector, CollectorResult } from './base';
import { UnifiedEvent } from '../../types';

// --- GDELT Collector ---
export class GDELTCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            // Using GDELT GeoJSON API for better location data
            const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=flight&mode=artlist&maxrecords=50&format=json';
            // Querying for "flight" or "conflict" or generic - user might want to customize query
            // For general conflict map, we might query generic keywords
            const queryUrl = `${this.config.apiUrl}?query=conflict%20OR%20riot%20OR%20protest&mode=artlist&maxrecords=30&format=json`;

            const data = await this.fetchJson(queryUrl);

            const events = (data.articles || []).map((article: any) => {
                // GDELT standard JSON doesn't always have rich geo in article list, 
                // but the GeoJSON endpoint is better. However, GeoJSON endpoint is strictly for map viz.
                // Let's stick to simple mapping for now.

                return this.normalize(article, {
                    id: article.url, // URL as ID
                    title: article.title,
                    summary: `Source: ${article.sourcecountry}. Language: ${article.language}`,
                    time: article.seendate, // Format might need adjustment (YYYYMMDDTHHMMSS)
                    // Synthesize coords if missing (GDELT article list lacks coords usually, requires GeoJSON mode)
                    // For demo, we might skip lat/lon or use a fallback
                    tags: ['conflict', 'news', 'gdelt'],
                    url: article.url,
                    severity: 'medium', // Hard to determine from raw text without analysis
                    confidence: 0.7
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- ACLED Collector (Paid/Auth Required) ---
export class ACLEDCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        // Only run if we have a key (mock check)
        // In real app, we check this.config.apiKey or similar
        // For now, we'll return a stub message if enabled but no key

        return {
            events: [],
            error: 'ACLED requires an API Key. Please configure it in settings.'
        };
    }
}
