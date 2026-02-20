import { UnifiedEvent, Asset, ImpactedAsset } from '../types';

/**
 * PHASE 4: THE RISK ENGINE
 * Implements the mathematical model: Risk = (T * V * C) / Cap
 */

// 1. THREAT CALCULATION (Normalize to 0-1)
export const calculateThreatScore = (event: UnifiedEvent, weather: any): number => {
    let baseScore = 0.5;

    // Severity Baseline
    if (event.severity === 'critical') baseScore = 1.0;
    else if (event.severity === 'high') baseScore = 0.8;
    else if (event.severity === 'medium') baseScore = 0.5;
    else baseScore = 0.3;

    // Context Modifiers (Weather)
    if (weather?.wind_kph > 50) {
        if (event.title.includes('Fire')) baseScore += 0.2;
        if (event.title.includes('Storm')) baseScore += 0.1;
    }

    // Sentiment Modifier (GDELT)
    // If we had sentiment in event details (we might add it to rawPayload or details), we'd use it here.

    return Math.min(1.0, baseScore);
};

// 2. VULNERABILITY & CRITICALITY (Lookup)
const ASSET_PROFILES: Record<string, { vulnerability: number, criticality: number }> = {
    'nuclear_power_plant': { vulnerability: 0.1, criticality: 1.0 }, // Hardened but Critical
    'power_plant': { vulnerability: 0.3, criticality: 0.8 },
    'substation': { vulnerability: 0.4, criticality: 0.6 },
    'submarine_cable': { vulnerability: 0.8, criticality: 0.9 }, // Fragile & Critical
    'telecom_tower': { vulnerability: 0.6, criticality: 0.5 },
    'data_center': { vulnerability: 0.2, criticality: 0.7 },
    'vessel': { vulnerability: 0.5, criticality: 0.5 },
    'airport': { vulnerability: 0.3, criticality: 0.7 },
    'seaport': { vulnerability: 0.3, criticality: 0.7 }
};

export const getAssetProfile = (type: string) => {
    return ASSET_PROFILES[type] || { vulnerability: 0.5, criticality: 0.5 };
};

// 3. CORE FORMULA
export const calculateRisk = (threat: number, assetType: string, distanceKm: number, impactRadius: number) => {
    const profile = getAssetProfile(assetType);

    // Proximity Factor: Closer = Higher Exposure
    // If distance is 0, Exposure is 1. If distance is Edge, Exposure is 0.1
    const proximity = Math.max(0, 1 - (distanceKm / impactRadius));

    // Effective Threat at Asset Location
    const effectiveThreat = threat * proximity;

    // Risk Formula
    // Risk = Threat * Vulnerability * Criticality (Consequence)
    let risk = effectiveThreat * profile.vulnerability * profile.criticality;

    return {
        score: Math.round(risk * 100), // 0-100
        vulnerability: profile.vulnerability,
        criticality: profile.criticality,
        details: `T(${effectiveThreat.toFixed(2)}) * V(${profile.vulnerability}) * C(${profile.criticality})`
    };
};
