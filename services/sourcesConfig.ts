
export interface SourceConfig {
    id: string;
    name: string;
    description: string;
    type: 'free' | 'paid';
    category: 'natural' | 'conflict' | 'infrastructure' | 'health' | 'space' | 'cyber';
    enabled: boolean;
    apiUrl: string;
    apiKeyRequired: boolean;
    documentationUrl?: string;
}

export const DATA_SOURCES: SourceConfig[] = [
    // --- Natural Disasters ---
    {
        id: 'usgs_earthquake',
        name: 'USGS Earthquakes',
        description: 'Real-time seismic data from US Geological Survey.',
        type: 'free',
        category: 'natural',
        enabled: true,
        apiUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
        apiKeyRequired: false
    },
    {
        id: 'gdacs_disaster',
        name: 'GDACS Disasters',
        description: 'Global Disaster Alert and Coordination System (UN/EU).',
        type: 'free',
        category: 'natural',
        enabled: true,
        apiUrl: 'https://www.gdacs.org/xml/rss.xml',
        apiKeyRequired: false
    },
    {
        id: 'nasa_eonet',
        name: 'NASA EONET',
        description: 'Earth Observatory Natural Event Tracker.',
        type: 'free',
        category: 'natural',
        enabled: true,
        apiUrl: 'https://eonet.gsfc.nasa.gov/api/v3/events',
        apiKeyRequired: false
    },
    {
        id: 'noaa_weather',
        name: 'NOAA Weather Alerts',
        description: 'Severe weather alerts from US National Weather Service.',
        type: 'free',
        category: 'natural',
        enabled: true,
        apiUrl: 'https://api.weather.gov/alerts/active',
        apiKeyRequired: false
    },

    // --- Conflict & Political ---
    {
        id: 'gdelt_project',
        name: 'GDELT Project',
        description: 'Global Database of Events, Language, and Tone (Conflict & Instability).',
        type: 'free',
        category: 'conflict',
        enabled: true,
        apiUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
        apiKeyRequired: false
    },
    {
        id: 'acled_conflict',
        name: 'ACLED (Armed Conflict)',
        description: 'Real-time conflict data. Requires API Key for full access.',
        type: 'paid',
        category: 'conflict',
        enabled: false, // Default disabled as it requires key/payment
        apiUrl: 'https://api.acleddata.com/acled/read',
        apiKeyRequired: true,
        documentationUrl: 'https://acleddata.com'
    },

    // --- Infrastructure ---
    {
        id: 'ioda_outages',
        name: 'IODA Internet Outages',
        description: 'Internet Outage Detection and Analysis (CAIDA).',
        type: 'free',
        category: 'infrastructure',
        enabled: true,
        apiUrl: 'https://api.internetoutage.io/v1/outages/summary', // Concept URL based on docs
        apiKeyRequired: false
    },
    {
        id: 'submarine_cables',
        name: 'Submarine Cables',
        description: 'Global Submarine Cable Map Data (TeleGeography).',
        type: 'free', // Often available as static data or free GitHub raw
        category: 'infrastructure',
        enabled: true,
        apiUrl: 'https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3/cable/cable-geo.json',
        apiKeyRequired: false
    },

    // --- Health ---
    {
        id: 'who_don',
        name: 'WHO Outbreaks',
        description: 'World Health Organization Disease Outbreak News.',
        type: 'free',
        category: 'health',
        enabled: true,
        apiUrl: 'https://www.who.int/rss-feeds/disease-outbreak-news.xml',
        apiKeyRequired: false
    },
    {
        id: 'promed_mail',
        name: 'ProMED Mail',
        description: 'Program for Monitoring Emerging Diseases.',
        type: 'free',
        category: 'health',
        enabled: true,
        apiUrl: 'https://promedmail.org/feed', // RSS
        apiKeyRequired: false
    },

    // --- Space Weather ---
    {
        id: 'noaa_space',
        name: 'NOAA Space Weather',
        description: 'Solar flares and geomagnetic storms.',
        type: 'free',
        category: 'space',
        enabled: true,
        apiUrl: 'https://services.swpc.noaa.gov/json/alerts.json',
        apiKeyRequired: false
    },

    // --- Cyber ---
    {
        id: 'cyber_threats',
        name: 'Global Cyber Threat Feeds',
        description: 'Aggregated fields from multiple open sources (AlienVault, etc).',
        type: 'free',
        category: 'cyber',
        enabled: true,
        apiUrl: '', // Custom aggregator
        apiKeyRequired: false
    }
];

export const getEnabledSources = () => DATA_SOURCES.filter(s => s.enabled);
export const getFreeSources = () => DATA_SOURCES.filter(s => s.type === 'free');
