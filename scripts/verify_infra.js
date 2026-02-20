/**
 * Verification Script for Infrastructure Service (OSM)
 * Usage: node scripts/verify_infra.js
 */

// We need a polyfill or simple fetch since we're in node environment without 'dom' lib
// Using node 18+ syntax
import fetch from 'node-fetch'; // Standard for this environment context if needed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

async function verifyInfra() {
    console.log("🔍 Testing OSM Overpass API (Finding assets near Fukushima, Japan)...");

    // Coordinates for Tokyo Station (Central Tokyo)
    const LAT = 35.6812;
    const LON = 139.7671;
    const RADIUS_M = 5000; // 5km

    const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${RADIUS_M},${LAT},${LON});
      node["public_transport"="station"](around:${RADIUS_M},${LAT},${LON});
    );
    out body 5;
    `;

    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: query
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        console.log(`✅ Status: ${response.status}`);
        console.log(`✅ Found ${data.elements.length} elements nearby.`);

        data.elements.forEach(e => {
            console.log(`   - [${e.tags.power || 'amenity'}] ${e.tags.name || 'Unnamed'} (ID: ${e.id})`);
        });

    } catch (error) {
        console.error("❌ Failed:", error.message);
    }

    console.log("\n🌊 Testing Submarine Cable Fetch...");
    // Test near Tokyo (Unity cable should be there)
    // Tokyo: 35.68, 139.76
    // Unity lands near Chikura (approx 34.9, 139.9) so 100km radius should find it.

    // Note: Since we can't easily import the TS service in this JS script without build step,
    // we will rely on reading the JSON directly to verify the data structure validity here.
    try {
        const cablesPath = path.join(__dirname, '../services/cables_sample.json');
        const raw = fs.readFileSync(cablesPath, 'utf8');
        const cables = JSON.parse(raw);
        console.log(`✅ Loaded ${cables.features.length} cables from sample.`);
        const unity = cables.features.find(f => f.properties.id === 'unity');
        if (unity) console.log(`   - Found Cable: ${unity.properties.name}`);
        else console.warn("⚠️ 'Unity' cable not found in sample.");
    } catch (e) {
        console.error("❌ Cable Check Failed:", e.message);
    }
}

verifyInfra();
