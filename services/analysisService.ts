import { UnifiedEvent, Asset, ImpactedAsset, RiskAnalysis } from '../types';
import { fetchNearbyInfrastructure, fetchNearbyCables } from './infrastructureService';
import { fetchEventWeather } from './weatherService';
import { fetchSimulatedShips } from './aisSimulation';
import { calculateThreatScore, calculateRisk } from './riskEngine';
import { enrichEventWithAI } from './aiService';

// ... (existing constants) ...

// Radius of concern based on event severity and category
const getImpactRadiusKm = (event: UnifiedEvent): number => {
    if (event.category === 'natural') {
        // ... (existing logic) ...
        // Earthquakes
        if (event.title.toLowerCase().includes('earthquake')) {
            const mag = parseFloat(event.summary.match(/Magnitude: ([0-9.]+)/)?.[1] || '0');
            if (mag >= 8) return 300;
            if (mag >= 7) return 100;
            if (mag >= 6) return 50;
            return 20;
        }
        // Floods/Storms (Generalization)
        return 30;
    }
    if (event.category === 'conflict') return 10; // 10km zone for conflicts
    return 5; // Default strict
};

// Helper: Simple distance check (Haversine or just Euclid for MVP short distances)
const isClose = (asset1: Asset, asset2: Asset, thresholdDeg = 0.05) => {
    return Math.abs(asset1.location.lat - asset2.location.lat) < thresholdDeg &&
        Math.abs(asset1.location.lon - asset2.location.lon) < thresholdDeg;
};

export const analyzeEventImpact = async (baseEvent: UnifiedEvent): Promise<UnifiedEvent> => {
    // 0. COGNITIVE LAYER: Enrich with AI (Llama/YOLO/Whisper)
    // We do this FIRST so the Risk Engine can potentially use AI sentiments
    const event = await enrichEventWithAI(baseEvent);

    // 1. Determine Impact Zone
    // ...

    // 2. Fetch Assets & Weather Context (Parallel)
    let assets: Asset[] = [];
    let weather = null;

    if (event.lat && event.lon) {
        try {
            const [infra, cables, weatherData, ships] = await Promise.all([
                fetchNearbyInfrastructure(event.lat, event.lon, getImpactRadiusKm(event)),
                fetchNearbyCables(event.lat, event.lon, getImpactRadiusKm(event)),
                fetchEventWeather(event.lat, event.lon),
                fetchSimulatedShips() // In real app, we'd filter by bounds here
            ]);

            // Filter ships to only those near the event (simple filter since simulation is small global fleet)
            const nearbyShips = ships.filter(s =>
                Math.abs(s.location.lat - event.lat!) < 1.0 &&
                Math.abs(s.location.lon - event.lon!) < 1.0
            );

            assets = [...infra, ...cables, ...nearbyShips];

            // FUSION SPECIAL: Check for "Ship vs Cable" risk
            // If we have a ship that is DRIFTING (Speed < 1) near a CABLE
            cables.forEach(cable => {
                nearbyShips.forEach(ship => {
                    if (ship.details?.speed < 1 && isClose(ship, cable)) {
                        // Create a "Synthetic Risk" attached to the Cable
                        // Or modify the cable's risk directly?
                        // For MVP, we'll mark the CABLE as high risk because of the SHIP.

                        // We attach a dynamic tag/alert to the cable asset
                        cable.details = { ...cable.details, alert: `THREAT: ${ship.name} Anchored Nearby!` };
                        // We also assume the SHIP is part of the "Event" context if the event is relevant?
                        // Actually, this logic usually runs periodically. Here we are running it "On Event".
                        // So if the EVENT is "Suspicious Activity", this is perfect.
                        // If the EVENT is "Earthquake", maybe less relevant unless ship is damaged.

                        // Let's assume we want to highlight this risk anyway if we are analyzing this zone.
                    }
                });
            });

            weather = weatherData;
        } catch (e) {
            console.error(`Failed to fuse data for event ${event.id}`, e);
        }
    }
    // ...

    // 3. Calculate Risk per Asset using Risk Engine
    const threatScore = calculateThreatScore(event, weather);
    const radiusKm = getImpactRadiusKm(event);

    const impactedAssets: ImpactedAsset[] = assets.map(asset => {
        // Approximate distance for now (randomish or based on lat/lon diff simplified)
        // For MVP, we'll assume assets in the "Nearby" list are at varying distances.
        // Let's calculate simple Euclidean distance in degrees * 111km
        const distDeg = Math.sqrt(Math.pow((asset.location.lat - (event.lat || 0)), 2) + Math.pow((asset.location.lon - (event.lon || 0)), 2));
        const distKm = distDeg * 111;

        // Use Risk Engine
        const calculation = calculateRisk(threatScore, asset.type, distKm, radiusKm);

        // Special Case: Ship vs Cable (Override)
        if (asset.details?.alert && asset.details.alert.includes('THREAT')) {
            calculation.score = 95; // Critical override
        }

        return {
            ...asset,
            distance: distKm,
            risk_score: calculation.score,
            vulnerability: calculation.vulnerability,
            criticality: calculation.criticality,
            impact_type: calculation.score > 80 ? 'direct_hit' : 'shockwave',
            estimated_damage: calculation.score > 80 ? 'Critical Failure' : 'Operational Risk',
            details: { ...asset.details, math: calculation.details } // Debug functionality
        };
    });

    // 4. Aggregate Global Risk Score
    const totalRisk = impactedAssets
        .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
        .slice(0, 5)
        .reduce((sum, a) => sum + (a.risk_score || 0), 0);

    const normalizedScore = Math.min(100, Math.round(totalRisk / 3)); // Normalize

    let level: RiskAnalysis['level'] = 'low';
    if (normalizedScore > 80) level = 'critical';
    else if (normalizedScore > 50) level = 'high';
    else if (normalizedScore > 20) level = 'medium';

    const recommendation = impactedAssets.length > 0
        ? `Alert: ${impactedAssets.length} assets at risk. Max Risk: ${Math.max(...impactedAssets.map(a => a.risk_score || 0))}%`
        : "No significant infrastructure risk.";

    return {
        ...event, // Return the AI-enriched event structure
        analysis: {
            score: normalizedScore,
            level,
            impacted_assets: impactedAssets,
            recommendation,
            timestamp: new Date().toISOString(),
            weather_context: weather,
            factors: {
                threat_score: threatScore,
                consequence_score: 0.8,
                vulnerability_score: 0.5
            }
        }
    };
};
