
import { BaseCollector, CollectorResult } from './base';
import { UnifiedEvent } from '../../types';

// --- NOAA Space Weather Collector ---
export class NOAASpaceCollector extends BaseCollector {
    async fetch(): Promise<CollectorResult> {
        try {
            const data = await this.fetchJson(this.config.apiUrl);

            // NOAA SWPC JSON format is typically a list of alerts
            const events = (Array.isArray(data) ? data : []).map((alert: any) => {
                return this.normalize(alert, {
                    id: alert.product_id,
                    title: alert.message || 'Space Weather Alert',
                    summary: alert.issue_datetime,
                    time: alert.issue_datetime,
                    severity: 'medium', // Default
                    tags: ['space', 'solar', 'noaa'],
                    url: 'https://www.swpc.noaa.gov/'
                });
            });

            return { events };
        } catch (e: any) {
            return { events: [], error: e.message };
        }
    }
}
