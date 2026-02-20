import { analyzeEventImpact } from '../services/analysisService';
import { UnifiedEvent } from '../types';

// Mock specific services for the test to avoid external API calls if possible,
// but for integration testing we might want to actually hit the "real" (mocked/sample) services.
// Since we are running in Node, we rely on the implementation of infrastructureService.
// infrastructureService uses fetch (real OSM) and local JSON (Cables).
// We should check if we need to mock fetch global for this script or if standard fetch works.
// Node 18+ has native fetch.

async function verifyFusion() {
    console.log("🧠 Testing Fusion Engine Core...\n");

    // 1. Simulate a Major Earthquake near Tokyo (where we know we have assets from previous test)
    // Tokyo Station: 35.6812, 139.7671
    const mockEarthquake = {
        id: 'test-eq-001',
        source: 'USGS-SIM',
        title: 'M 7.5 Earthquake - Tokyo Bay',
        summary: 'Magnitude: 7.5. Depth: 10km.',
        severity: 'critical',
        category: 'natural',
        confidence: 1.0,
        time: new Date().toISOString(),
        lat: 35.6812,
        lon: 139.7671,
        tags: ['earthquake', 'test']
    };

    console.log(`Event: ${mockEarthquake.title}`);
    console.log(`Location: ${mockEarthquake.lat}, ${mockEarthquake.lon}`);
    console.log("Analyzing Impact...\n");

    try {
        const analysis = await analyzeEventImpact(mockEarthquake);

        console.log("--- ANALYSIS REPORT ---");
        console.log(`Global Risk Score: ${analysis.score}/100`);
        console.log(`Risk Level: ${analysis.level?.toUpperCase()}`);
        console.log(`Recommendation: ${analysis.recommendation}`);
        console.log(`\nImpacted Assets: ${analysis.impacted_assets.length}`);

        analysis.impacted_assets.slice(0, 5).forEach(asset => {
            console.log(`   - [${asset.type}] ${asset.name}`);
            console.log(`     Risk Score: ${asset.risk_score} | Impact: ${asset.estimated_damage}`);
        });

        if (analysis.impacted_assets.length > 0 && analysis.score > 0) {
            console.log("\n✅ Fusion Engine verification PASSED: Assets correlated and scored.");
        } else {
            console.log("\n⚠️ Fusion Engine verification WARN: No assets found or score is 0. (Check OSM connectivity or Cable sample)");
        }

    } catch (e) {
        console.error("\n❌ Fusion Engine FAILED:", e);
    }
}

verifyFusion();
