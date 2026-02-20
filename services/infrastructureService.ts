import { Asset, AssetType } from '../types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Helper to construct Overpass QL queries
// We search for nodes, ways, and relations but mostly focus on nodes/ways for simplicity in MVP
// "around:radius,lat,lon" is the key spatial filter
const buildQuery = (lat: number, lon: number, radiusMs: number) => {
    return `
    [out:json][timeout:10];
    (
      // Power Infrastructure
      node["power"="plant"](around:${radiusMs},${lat},${lon});
      node["power"="substation"](around:${radiusMs},${lat},${lon});
      
      // Telecom
      node["man_made"="tower"]["tower:type"="communication"](around:${radiusMs},${lat},${lon});
      node["telecom"="data_center"](around:${radiusMs},${lat},${lon});
      
      // Transport (Airports, Ports)
      node["aeroway"="aerodrome"](around:${radiusMs},${lat},${lon});
      node["harbour"](around:${radiusMs},${lat},${lon});
    );
    out body 20; // Limit to 20 items for MVP performance
    >;
    out skel qt;
    `;
};

const mapOsmToAsset = (element: any): Asset => {
    let type: AssetType = 'telecom_tower'; // Fallback
    const tags = element.tags || {};

    if (tags.power === 'plant') type = 'power_plant';
    else if (tags.power === 'substation') type = 'substation';
    else if (tags.telecom === 'data_center') type = 'data_center';
    else if (tags.aeroway === 'aerodrome') type = 'airport';
    else if (tags.harbour) type = 'seaport';

    return {
        id: `osm-${element.id}`,
        type,
        name: tags.name || tags['name:en'] || `${type.replace('_', ' ')} (${element.id})`,
        location: {
            lat: element.lat,
            lon: element.lon
        },
        details: {
            operator: tags.operator,
            capacity: tags['generator:output:electricity'],
            source: 'OpenStreetMap'
        }
    };
};

export const fetchNearbyInfrastructure = async (lat: number, lon: number, radiusKm: number = 10): Promise<Asset[]> => {
    try {
        const radiusMs = radiusKm * 1000;
        const query = buildQuery(lat, lon, radiusMs);

        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: query
        });

        if (!response.ok) throw new Error(`Overpass API Error: ${response.status}`);

        const data = await response.json();

        // Filter only 'node' elements for this simple implementation (ways/relations need centroid calc)
        return data.elements
            .filter((e: any) => e.type === 'node' && e.tags)
            .map(mapOsmToAsset);

    } catch (error) {
        console.error('Infrastructure Fetch Error:', error);
        return [];
    }
};

// Sample Data Import (In a real app, strict JSON import or fetch from public URL)
import cablesSample from './cables_sample.json';

export const fetchNearbyCables = async (lat: number, lon: number, radiusKm: number = 50): Promise<Asset[]> => {
    // Basic bounding box check for MVP (LineStrings are complex to distance-check perfectly without Turf.js)
    // We check if any point in the cable is somewhat near, or just return all for demo if "global" view.

    // For this specific 'nearby' check, we'll traverse the coordinates of the sample cables.
    const nearby: Asset[] = [];
    const radiusDeg = radiusKm / 111; // Approx conversion km to degrees

    (cablesSample as any).features.forEach((feature: any) => {
        const coords = feature.geometry.coordinates;
        let isNear = false;

        // Check identifying points (simplified)
        for (const [cLon, cLat] of coords) {
            if (Math.abs(cLat - lat) < radiusDeg && Math.abs(cLon - lon) < radiusDeg) {
                isNear = true;
                break;
            }
        }

        if (isNear) {
            nearby.push({
                id: `cable-${feature.properties.id}`,
                type: 'submarine_cable',
                name: feature.properties.name,
                location: { lat: coords[0][1], lon: coords[0][0] }, // landing point approx
                details: {
                    capacity: feature.properties.capacity,
                    owners: feature.properties.owners,
                    geometry: feature.geometry // Pass full geometry for map rendering
                },
                risk_score: 0 // To be calculated
            });
        }
    });

    return nearby;
};
