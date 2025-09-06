// src/app/services/mockDataService.ts
import { LatLngExpression } from "leaflet";

// Helper to generate a random number in a range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to generate a realistic trajectory for a float
const generateTrajectory = (startPos: LatLngExpression): LatLngExpression[] => {
    const trajectory: LatLngExpression[] = [startPos];
    let [lat, lon] = startPos as [number, number];
    const segments = Math.floor(random(5, 15));

    for (let i = 0; i < segments; i++) {
        lat += random(-0.5, 0.5);
        lon += random(-0.8, 0.8);
        // Clamp to Indian Ocean bounds to keep it realistic
        lat = Math.max(-25, Math.min(25, lat));
        lon = Math.max(40, Math.min(100, lon));
        trajectory.push([parseFloat(lat.toFixed(3)), parseFloat(lon.toFixed(3))]);
    }
    return trajectory;
};

// Main function to generate a new set of mock floats
export const generateMockFloats = (count = 50) => {
    const projects = ["INCOIS", "NOAA", "CSIRO", "JAMSTEC"];
    const regions: { [key: string]: { center: [number, number], radius: number } } = {
        "Arabian Sea": { center: [15, 65], radius: 10 },
        "Bay of Bengal": { center: [15, 90], radius: 8 },
        "Equatorial Indian Ocean": { center: [0, 80], radius: 15 },
    };

    return Array.from({ length: count }, (_, i) => {
        const id = i + 1;
        const platform_number = Math.floor(random(10000, 999999));
        const project_name = projects[i % projects.length];
        
        const regionKeys = Object.keys(regions);
        const regionName = regionKeys[i % regionKeys.length];
        const regionConfig = regions[regionName];
        
        const lat = random(regionConfig.center[0] - regionConfig.radius, regionConfig.center[0] + regionConfig.radius);
        const lon = random(regionConfig.center[1] - regionConfig.radius, regionConfig.center[1] + regionConfig.radius);
        const position: LatLngExpression = [parseFloat(lat.toFixed(3)), parseFloat(lon.toFixed(3))];
        const trajectory = generateTrajectory(position);
        
        // Simulate a date within the allowed range
        const day = Math.floor(random(1, 180)); // Jan 1 to June 30
        const date = new Date(2022, 0, day);

        return {
            id,
            platform_number,
            project_name,
            last_cycle: Math.floor(random(5, 50)),
            position,
            trajectory,
            region: regionName,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
        };
    });
};
