
import { fetchAllEvents } from '../services/dataService';
import { DATA_SOURCES } from '../services/sourcesConfig';

// Mock browser APIs if not present (since we're running in CLI node)
if (typeof fetch === 'undefined') {
    console.log("Installing fetch polyfill for Node environment...");
    // In a real CLI run, we might need node-fetch, but 'bun' or modern node has fetch.
    // Assuming environment has fetch.
}

async function runTest() {
    console.log("🚀 Starting Data Sources Verification...");
    console.log(`📋 Configured Sources: ${DATA_SOURCES.length}`);

    const freeSources = DATA_SOURCES.filter(s => s.type === 'free');
    console.log(`✅ Free Sources Enabled: ${freeSources.length}`);

    try {
        console.log("\n🔄 Fetching events from all enabled sources...");
        const events = await fetchAllEvents();

        console.log(`\n🎉 Success! Fetched ${events.length} total events.`);

        // Breakdown by source
        const bySource = events.reduce((acc: any, event) => {
            acc[event.source] = (acc[event.source] || 0) + 1;
            return acc;
        }, {});

        console.table(bySource);

        console.log("\n🔍 Sample Event:");
        console.log(events[0]);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    }
}

runTest();
