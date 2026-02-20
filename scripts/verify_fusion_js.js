/**
 * Verification Script for Fusion Engine (Standalone JS Version)
 * Usage: node scripts/verify_fusion_js.js
 */

// Mock Assets & Risk Config
const ASSET_CRITICALITY = {
    'nuclear_power_plant': 100,
    'power_plant': 80,
    'submarine_cable': 85,
    'data_center': 75,
    'telecom_tower': 60,
    'airport': 70,
    'substation': 60
};

// Mock Infrastructure Service (Simulating what infrastructureService.ts does)
const mockFetchAssets = async (lat, lon, radiusKm) => {
    // Return dummy assets near Tokyo for testing
    return [
        {
            id: 'osm-123',
            type: 'power_plant',
            name: 'Tokyo Bay Thermal Power Station',
            location: { lat: 35.6, lon: 139.8 },
            details: { operator: 'TEPCO' }
        },
        {
            id: 'cable-unity',
            type: 'submarine_cable',
            name: 'Unity / EAGLE',
            location: { lat: 34.9, lon: 139.9 },
            details: { capacity: '4.8 Tbps' }
        }
    ];
};

// The Fusion Logic (Ported from analysisService.ts)
const analyzeEventImpact = async (event) => {
    console.log(`\n🤖 AI Risk Analysis for: ${event.title}`);

    // 1. Determine Radius
    let radiusKm = 20;
    const magMatch = event.summary.match(/Magnitude: ([0-9.]+)/);
    if (magMatch) {
        const mag = parseFloat(magMatch[1]);
        if (mag >= 7) radiusKm = 100;
        if (mag >= 8) radiusKm = 300;
    }
    console.log(`   - Impact Radius: ${radiusKm} km`);

    // 2. Fetch Assets
    const assets = await mockFetchAssets(event.lat, event.lon, radiusKm);
    console.log(`   - Found ${assets.length} nearby assets.`);

    // 3. Calculate Risk
    const impactedAssets = assets.map(asset => {
        const criticality = ASSET_CRITICALITY[asset.type] || 50;
        const severityScore = event.severity === 'critical' ? 1.0 : 0.8;
        const riskScore = criticality * severityScore;

        return {
            ...asset,
            risk_score: riskScore,
            impact_type: riskScore > 80 ? 'direct_hit' : 'shockwave',
            estimated_damage: riskScore > 80 ? 'Critical Failure Risk' : 'Shake Damage Risk'
        };
    });

    // 4. Summarize
    const totalRisk = impactedAssets.reduce((sum, a) => sum + a.risk_score, 0);
    const score = Math.min(100, Math.round(totalRisk / 3));

    return {
        score,
        level: score > 80 ? 'critical' : score > 50 ? 'high' : 'medium',
        impacted_assets: impactedAssets,
        recommendation: `Alert: ${impactedAssets.length} assets impacted. Immediate check required.`
    };
};

// Test Runner
async function runTest() {
    const mockEarthquake = {
        id: 'test-eq-001',
        title: 'M 7.5 Earthquake - Tokyo Bay',
        summary: 'Magnitude: 7.5. Depth: 10km.',
        severity: 'critical',
        lat: 35.6812,
        lon: 139.7671,
    };

    const result = await analyzeEventImpact(mockEarthquake);

    console.log("\n--- RESULT ---");
    console.log(`Risk Score: ${result.score}/100 [${result.level.toUpperCase()}]`);
    result.impacted_assets.forEach(a => {
        console.log(`⚠️  ${a.name} (${a.type}) -> Score: ${a.risk_score}`);
    });
}

runTest();
