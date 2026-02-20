
import { UnifiedEvent } from '../../types';
import { SourceConfig } from '../sourcesConfig';

export interface CollectorResult {
    events: UnifiedEvent[];
    error?: string;
}

export abstract class BaseCollector {
    protected config: SourceConfig;

    constructor(config: SourceConfig) {
        this.config = config;
    }

    /**
     * Fetch events from the source
     */
    abstract fetch(): Promise<CollectorResult>;

    /**
     * Common helper to normalize raw data into UnifiedEvent
     */
    protected normalize(raw: any, partial: Partial<UnifiedEvent>): UnifiedEvent {
        return {
            id: partial.id || crypto.randomUUID(),
            source: this.config.name,
            category: this.config.category,
            time: partial.time || new Date().toISOString(),
            confidence: partial.confidence || 0.8,
            severity: partial.severity || 'medium',
            title: partial.title || 'Unknown Event',
            summary: partial.summary || '',
            tags: [...(partial.tags || []), this.config.category, this.config.id],
            url: partial.url,
            lat: partial.lat,
            lon: partial.lon,
            rawPayload: raw
        };
    }

    protected async fetchJson(url: string, options?: RequestInit): Promise<any> {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return await res.json();
        } catch (e: any) {
            console.error(`[Collector] Failed to fetch ${this.config.name}:`, e);
            throw e;
        }
    }

    // Helper for RSS (using rss2json proxy for client-side friendliness)
    protected async fetchRss(url: string): Promise<any> {
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        return this.fetchJson(proxyUrl);
    }
}
