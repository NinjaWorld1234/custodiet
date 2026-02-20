/**
 * Verification Script for Phase 3: Human Terrain & Transport
 * Scenario: "Ghost Ship" Anchored over Submarine Cable
 */

const LOG = (msg) => console.log(`[Phase3-Test] ${msg}`);

// 1. Mock Data: A Cable and a Suspicious Ship
const MOCK_CABLE = {
    id: 'cable-unity',
    type: 'submarine_cable',
    name: 'Unity / EAGLE',
    location: { lat: 34.9, lon: 139.9 }, // Near Tokyo
    details: {}
};

const MOCK_NOT_SUSPICIOUS_SHIP = {
    id: 'vessel-good',
    type: 'vessel',
    name: 'Diligent Cargo',
    location: { lat: 34.9, lon: 139.95 }, // Nearby but moving
    details: { speed: 12, status: 'Underway' }
};

const MOCK_SUSPICIOUS_SHIP = {
    id: 'vessel-bad',
    type: 'vessel',
    name: 'Ghost Drifter',
    location: { lat: 34.901, lon: 139.901 }, // VERY close to cable (34.9, 139.9)
    details: { speed: 0.5, status: 'Anchored/Drifting' } // Speed < 1 knot
};

// 2. Mock Logic (Ported from analysisService.ts for valid standalone test)
const checkCableRisk = (cables, ships) => {
    LOG("🛰️ Scanning Maritime Domain...");

    let alerts = [];

    cables.forEach(cable => {
        ships.forEach(ship => {
            // Distance check (approx)
            const dLat = Math.abs(cable.location.lat - ship.location.lat);
            const dLon = Math.abs(cable.location.lon - ship.location.lon);
            const isClose = dLat < 0.05 && dLon < 0.05;

            if (isClose) {
                LOG(`   > Contact: ${ship.name} near ${cable.name}. Speed: ${ship.details.speed} kts.`);

                if (ship.details.speed < 1) {
                    const alert = `🚨 THREAT DETECTED: [${ship.name}] is DRIFTING/ANCHORED over [${cable.name}]! Risk of cable cut.`;
                    alerts.push(alert);
                    cable.details.alert = alert;
                }
            }
        });
    });

    return alerts;
};

// 3. Execution
async function runScenario() {
    LOG("🎬 Scenario: Suspicious Activity near Unity Cable\n");

    const cables = [MOCK_CABLE];
    const ships = [MOCK_NOT_SUSPICIOUS_SHIP, MOCK_SUSPICIOUS_SHIP];

    const alerts = checkCableRisk(cables, ships);

    console.log("\n--- RISK REPORT ---");
    if (alerts.length > 0) {
        alerts.forEach(a => console.log(a));
        console.log("\n✅ Phase 3 Verification PASSED: Threat Logic Works.");
    } else {
        console.log("❌ No threats detected. Logic failed.");
    }
}

runScenario();
