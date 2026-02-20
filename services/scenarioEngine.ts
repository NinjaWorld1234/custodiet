import { UnifiedEvent } from '../types';

/**
 * SCENARIO ENGINE: OPERATION RED TIDE
 * A predefined sequence of events to test Hybrid Threat Detection.
 */

const BASE_TIME = new Date();
const LOCATION = { lat: 25.0, lon: 57.5 }; // Hormuz Region

export const SCENARIO_RED_TIDE = [
    // T-12: The Rhetoric (Human Terrain)
    {
        id: 'sim-gdelt-001',
        source: 'GDELT',
        category: 'geopolitics',
        severity: 'medium',
        confidence: 0.9,
        title: 'Naval Exercises Announced in Gulf',
        summary: 'State media announces unscheduled live-fire naval drills near critical shipping lanes. Tone: Hostile (-8.0).',
        time: new Date(BASE_TIME.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        lat: LOCATION.lat,
        lon: LOCATION.lon,
        tags: ['military', 'exercise', 'threat']
    } as UnifiedEvent,

    // T-4: The Cyber Softening (Cyber Layer)
    {
        id: 'sim-cyber-001',
        source: 'CISA KEV',
        category: 'cyber',
        severity: 'high',
        confidence: 1.0,
        title: 'CVE-2026-9999: Port Authority SCADA Vulnerability',
        summary: 'Critical RCE vulnerability detected in maritime logistics software used in regional ports. Active exploitation reported.',
        time: new Date(BASE_TIME.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        tags: ['exploit', 'scada', 'maritime', 'cve']
    } as UnifiedEvent,

    // T-0: The Physical Act (Maritime Layer)
    {
        id: 'sim-ais-001',
        source: 'AIS-Sim',
        category: 'transport',
        severity: 'critical', // In real life might start low, but here we assume the "Stop" triggers it
        confidence: 0.95,
        title: 'Vessel "Ghost 1" Anchored Over Cable',
        summary: 'Fishing vessel went dark and is loitering (Speed 0.2kts) directly over "FALCON" Submarine Cable.',
        time: BASE_TIME.toISOString(),
        lat: LOCATION.lat + 0.001, // Very close
        lon: LOCATION.lon + 0.001,
        tags: ['ais', 'suspicious', 'cable_threat']
    } as UnifiedEvent
];

export const getScenarioEvents = () => SCENARIO_RED_TIDE;
