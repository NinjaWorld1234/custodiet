import { Asset } from '../types';

/**
 * AIS Simulator
 * Generates realistic "Ghost Ships" along major shipping lanes.
 * 
 * Trade Routes Simulated:
 * 1. Suez Canal to Gibraltar (Mediterranean)
 * 2. Strait of Malacca (Asia)
 * 3. Strait of Hormuz (Gulf)
 */

interface ShipDefinition {
    id: string;
    name: string;
    type: 'tanker' | 'cargo' | 'fishing' | 'naval';
    flag: string;
    route_start: [number, number]; // [lat, lon]
    route_end: [number, number];   // [lat, lon]
    speed_knots: number;
    progress: number; // 0.0 to 1.0 (Location along route)
}

// Initial Ghost Fleet
const FLEET: ShipDefinition[] = [
    { id: 'vessel-001', name: 'Ever Given II', type: 'cargo', flag: 'PA', route_start: [29.9, 32.5], route_end: [31.2, 32.3], speed_knots: 12, progress: 0.2 }, // Suez
    { id: 'vessel-002', name: 'Eagle Ray', type: 'tanker', flag: 'LR', route_start: [26.5, 56.5], route_end: [25.0, 57.5], speed_knots: 10, progress: 0.5 }, // Hormuz
    { id: 'vessel-003', name: 'Blue Marlin', type: 'fishing', flag: 'JP', route_start: [35.0, 140.0], route_end: [34.5, 139.5], speed_knots: 5, progress: 0.1 }, // Tokyo Bay (Near our Cable Test!)
    { id: 'vessel-004', name: 'USS Test', type: 'naval', flag: 'US', route_start: [34.8, 139.8], route_end: [35.0, 139.9], speed_knots: 0, progress: 0.0 }, // Stationary near Tokyo Cable (Drifting/Anchored)
];

// Helper to interpolate position
const interpolate = (start: number, end: number, progress: number) => start + (end - start) * progress;

export const fetchSimulatedShips = async (): Promise<Asset[]> => {
    // In a real app, this would update ship positions based on time.
    // For this stateless fetch, we just return them slightly jittered or static for now,
    // or ideally we'd store state. For MVP, we return static snapshots.

    return FLEET.map(ship => {
        const lat = interpolate(ship.route_start[0], ship.route_end[0], ship.progress);
        const lon = interpolate(ship.route_start[1], ship.route_end[1], ship.progress);

        // Return as Asset type 'seaport' or we need a new 'vessel' type?
        // We added 'submarine_cable' but not 'vessel'. Let's reuse 'seaport' or 'substation' temporarily or add 'vessel' to AssetType.
        // Or better, cast it to 'seaport' but put real type in details.
        // Actually, let's update types.ts to include 'vessel'.

        return {
            id: ship.id,
            type: 'vessel',
            name: `${ship.name} (${ship.flag})`,
            location: { lat, lon },
            details: {
                vessel_type: ship.type,
                speed: ship.speed_knots,
                status: ship.speed_knots < 1 ? 'Anchored/Drifting' : 'Underway',
                simulated: true
            },
            risk_score: 0
        };
    });
};
