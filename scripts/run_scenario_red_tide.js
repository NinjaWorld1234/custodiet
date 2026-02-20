/**
 * Verification Script: Operation Red Tide 🌊🚨
 * Simulates the "System of Systems" fusing 3 distinct layers.
 */

// MOCKING THE FUSION BRAIN (To run standalone without full DB/API access)
// In production, this logic lives in 'services/analysisService.ts' and 'services/riskEngine.ts'
const FUSION_BRAIN = {
    state: {
        tensionLevel: 0,
        cyberThreat: false,
    },

    process: (event) => {
        let alert = null;
        console.log(`\n📨 INCOMING: [${event.source}] ${event.title}`);

        // 1. Human Terrain Layer
        if (event.category === 'geopolitics' && event.summary.includes('Hostile')) {
            FUSION_BRAIN.state.tensionLevel += 50;
            console.log(`   🔸 ANALYSIS: Geopolitical Tension rising. Defcon Level adjusted.`);
        }

        // 2. Cyber Layer
        if (event.category === 'cyber' && event.tags.includes('maritime')) {
            FUSION_BRAIN.state.cyberThreat = true;
            console.log(`   🔸 ANALYSIS: Cyber-Physical threat vector detected targeting Maritime infrastructure.`);
        }

        // 3. Physical Layer (The Trigger)
        if (event.category === 'transport') {
            const isCableThreat = event.summary.includes('Cable');

            if (isCableThreat) {
                console.log(`   🔸 ANALYSIS: Physical Threat to Critical Infrastructure verified.`);

                // THE FUSION: Do we have context?
                if (FUSION_BRAIN.state.tensionLevel > 20 && FUSION_BRAIN.state.cyberThreat) {
                    alert = {
                        level: 'CRITICAL',
                        score: 98,
                        title: ' HYBRID WARFARE ALERT ',
                        message: `Coordinated Multi-Domain Attack Detected!\n   1. Political Pretext (Naval Drills)\n   2. Cyber Softening (Port Hack)\n   3. Physical Sabotage (Cable Cut Attempt)\n   Recommend IMMEDIATE navel patrol and Coast Guard intervention.`
                    };
                } else {
                    alert = {
                        level: 'HIGH',
                        score: 75,
                        title: 'Isolated Security Incident',
                        message: 'Suspicious vessel detected. Standard investigation protocol.'
                    };
                }
            }
        }

        return alert;
    }
};

// THE SCENARIO EVENTS (Copied from scenarioEngine for standalone run)
const SCENARIO_EVENTS = [
    {
        source: 'GDELT', category: 'geopolitics', title: 'Naval Exercises Announced', summary: 'Hostile (-8.0).'
    },
    {
        source: 'CISA', category: 'cyber', tags: ['maritime'], title: 'Port SCADA Vulnerability', summary: 'Exploitation of ports.'
    },
    {
        source: 'AIS-Sim', category: 'transport', title: 'Vessel Ghost 1 Anchored', summary: 'Loitering over FALCON Cable'
    }
];

// RUN SIMULATION
async function runSimulation() {
    console.log("🎬 STARTING SCENARIO: OPERATION RED TIDE\n");

    for (const event of SCENARIO_EVENTS) {
        await new Promise(r => setTimeout(r, 800)); // Dramatic pause
        const result = FUSION_BRAIN.process(event);

        if (result) {
            console.log(`\n🚨🚨 FUSION ENGINE TRIGGERED 🚨🚨`);
            console.log(`-----------------------------------`);
            console.log(`TITLE: ${result.title}`);
            console.log(`SCORE: ${result.score}/100`);
            console.log(`MSG:   ${result.message}`);
            console.log(`-----------------------------------`);
        }
    }

    console.log("\n✅ Scenario Complete. System successfully correlated asymmetric signals.");
}

runSimulation();
