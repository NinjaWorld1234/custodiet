import { UnifiedEvent } from '../types';
import sourcesConfig from './sources.json';
import { DataSource } from './sourceConfig';

const CISA_KEV_ID = 'cyber_vulnerabilities_cisa_kev_catalog_json_feed';
const URLHAUS_ID = 'cyber_malicious_urls_urlhaus_api_base';

export const fetchCisaVulnerabilities = async (): Promise<UnifiedEvent[]> => {
    try {
        const config = (sourcesConfig.selected_sources as DataSource[]).find(s => s.source_id === CISA_KEV_ID);
        if (!config) return [];

        const response = await fetch(config.endpoint);
        if (!response.ok) throw new Error('CISA Fetch Failed');

        const data = await response.json();
        const vulnerabilities = data.vulnerabilities || [];

        // Return the latest 20 vulnerabilities
        return vulnerabilities.slice(0, 20).map((vuln: any) => ({
            id: `cisa-${vuln.cveID}`,
            source: 'CISA KEV',
            category: 'cyber',
            severity: 'high', // Known exploited vulnerabilities are generally high/critical
            confidence: 1.0,
            title: `${vuln.cveID}: ${vuln.vulnerabilityName}`,
            summary: `${vuln.shortDescription}\nVendor: ${vuln.vendorProject}, Product: ${vuln.product}.`,
            time: new Date(vuln.dateAdded).toISOString(),
            tags: ['cve', 'vulnerability', 'exploited', 'cisa'],
            url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
        }));

    } catch (error) {
        console.error('CISA Fetch Error:', error);
        return [];
    }
};

export const fetchUrlHausPayloads = async (): Promise<UnifiedEvent[]> => {
    try {
        const config = (sourcesConfig.selected_sources as DataSource[]).find(s => s.source_id === URLHAUS_ID);
        if (!config) return [];

        // URLhaus recent payloads endpoint
        const response = await fetch(`${config.endpoint}/payloads/recent/`);
        if (!response.ok) throw new Error('URLhaus Fetch Failed');

        const data = await response.json();
        const payloads = data.payloads || [];

        return payloads.slice(0, 15).map((item: any) => ({
            id: `urlhaus-${item.sha256_hash.substring(0, 12)}`,
            source: 'URLhaus',
            category: 'cyber',
            severity: 'medium',
            confidence: 0.9,
            title: `Malware Payload: ${item.file_type}`,
            summary: `Signatures: ${item.signature || 'Unknown'}. Hash: ${item.sha256_hash}`,
            time: new Date(item.firstseen).toISOString(),
            tags: ['malware', 'urlhaus', item.file_type],
            url: item.urlhaus_link
        }));

    } catch (error) {
        console.error('URLhaus Fetch Error:', error);
        return [];
    }
};

export const fetchCyberEvents = async (): Promise<UnifiedEvent[]> => {
    const [cisa, urlhaus] = await Promise.allSettled([
        fetchCisaVulnerabilities(),
        fetchUrlHausPayloads()
    ]);

    return [
        ...(cisa.status === 'fulfilled' ? cisa.value : []),
        ...(urlhaus.status === 'fulfilled' ? urlhaus.value : [])
    ];
};
