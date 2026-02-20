/**
 * Verification Script for USGS Data Fetcher
 * usage: node scripts/verify_usgs.js
 */

import fetch from 'node-fetch'; // Requires node-fetch or Node 18+ native fetch
import fs from 'fs';
import path from 'path';

// Polyfill fetch for older Node versions if needed, though modern Node has it.
// If running in an environment without top-level await or fetch, might need adjustments.
// Assuming Node 18+ for this project.

const SOURCES_CONFIG_PATH = path.join(process.cwd(), 'services', 'sources.json');

async function verifyUSGS() {
    console.log("🔍 Starting USGS Verification...");

    // 1. Load Configuration
    if (!fs.existsSync(SOURCES_CONFIG_PATH)) {
        console.error("❌ Link Error: services/sources.json not found!");
        process.exit(1);
    }

    const configRaw = fs.readFileSync(SOURCES_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configRaw);

    // 2. Find USGS Source
    const USGS_ID = 'natural_earthquakes_usgs_earthquakes_all_past_hour';
    const sourceConfig = config.selected_sources.find(s => s.source_id === USGS_ID);

    if (!sourceConfig) {
        console.error(`❌ Config Error: Source ID '${USGS_ID}' not found in sources.json`);
        process.exit(1);
    }

    console.log(`✅ Config Loaded. Endpoint: ${sourceConfig.endpoint}`);

    // 3. Fetch Data
    try {
        console.log("⬇️ Fetching data from USGS...");
        const response = await fetch(sourceConfig.endpoint);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 4. Validate Structure
        if (!data.features || !Array.isArray(data.features)) {
            console.error("❌ Validation Failed: 'features' array missing in response.");
            process.exit(1);
        }

        console.log(`✅ Fetch Success: Retrieved ${data.features.length} events.`);

        // 5. Check Sample Event
        if (data.features.length > 0) {
            const sample = data.features[0];
            console.log("\n📄 Sample Event:");
            console.log(`   - Title: ${sample.properties.title}`);
            console.log(`   - Mag: ${sample.properties.mag}`);
            console.log(`   - Time: ${new Date(sample.properties.time).toISOString()}`);
            console.log(`   - Geometry: [${sample.geometry.coordinates.join(', ')}]`);
        } else {
            console.warn("⚠️ No events found in the past hour (this is possible but rare globally).");
        }

        console.log("\n🎉 Verification Passed!");

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
        process.exit(1);
    }
}

verifyUSGS();
