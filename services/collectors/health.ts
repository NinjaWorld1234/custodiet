
import { BaseCollector, CollectorResult } from './base';

// --- WHO Collector ---
export class WHOCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchRss(this.config.apiUrl);
            if (data.status !== 'ok') throw new Error('WHO RSS feed invalid');

            const events = data.items.map((item: any) => {
                return this.normalize(item, {
                    id: item.guid,
                    title: item.title,
                    summary: item.description,
                    time: item.pubDate,
                    severity: 'high', // Disease outbreaks are generally high concern
                    tags: ['health', 'disease', 'who'],
                    url: item.link
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}

// --- ProMED Collector ---
export class ProMEDCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchRss(this.config.apiUrl);
            if (data.status !== 'ok') throw new Error('ProMED RSS feed invalid');

            const events = data.items.map((item: any) => {
                return this.normalize(item, {
                    id: item.guid,
                    title: item.title,
                    summary: item.description,
                    time: item.pubDate,
                    severity: 'medium',
                    tags: ['health', 'promed'],
                    url: item.link
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}
