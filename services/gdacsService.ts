import { UnifiedEvent } from '../types';

const GDACS_FEED_URL = 'https://www.gdacs.org/xml/rss.xml';

export const fetchGdacsEvents = async (): Promise<UnifiedEvent[]> => {
    try {
        const response = await fetch(GDACS_FEED_URL);
        if (!response.ok) throw new Error('Failed to fetch GDACS feed');

        const xmlText = await response.text();

        // Simple XML parsing/Regex for MVP to avoid external parser deps in browser
        // In a real app we'd use DOMParser or fast-xml-parser
        const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

        return items.map(item => {
            const titleMatch = item.match(/<title>(.*?)<\/title>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const descMatch = item.match(/<description>(.*?)<\/description>/);
            const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
            const geoMatch = item.match(/<georss:point>(.*?)<\/georss:point>/) || item.match(/<geo:lat>(.*?)<\/geo:lat>[\s\S]*?<geo:long>(.*?)<\/geo:long>/);

            // GDACS specific: Alert Level
            const alertMatch = item.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/);
            const alertLevel = alertMatch ? alertMatch[1] : 'Green';

            let lat = 0, lon = 0;
            if (geoMatch) {
                if (geoMatch[0].includes('georss:point')) {
                    [lat, lon] = geoMatch[1].split(' ').map(Number);
                } else {
                    // fallback if separate tags
                }
            }

            // Map GDACS Level to Severity
            let severity: UnifiedEvent['severity'] = 'low';
            if (alertLevel === 'Red') severity = 'critical';
            else if (alertLevel === 'Orange') severity = 'high';
            else if (alertLevel === 'Green') severity = 'medium';

            const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : 'Unknown Disaster';

            return {
                id: `gdacs-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
                source: 'GDACS',
                category: 'natural',
                severity,
                confidence: 1.0, // GDACS is authoritative
                title,
                summary: descMatch ? descMatch[1].replace(/<[^>]*>?/gm, '') : 'No description', // Strip HTML
                time: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
                lat,
                lon,
                tags: ['gdacs', 'disaster', alertLevel.toLowerCase()],
                url: linkMatch ? linkMatch[1] : GDACS_FEED_URL
            };
        });

    } catch (error) {
        console.error('GDACS Fetch Error:', error);
        return [];
    }
};
