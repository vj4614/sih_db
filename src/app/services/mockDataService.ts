// src/app/services/mockDataService.ts
import { LatLngExpression } from "leaflet";

// A static, pre-defined set of realistic float data. This is fast and reliable.
const staticFloats = [
  { id: 1, platform_number: 2901234, project_name: "INCOIS", color: "#FF7F50", position: [10, 65], trajectory: [[12, 63], [11, 64], [10, 65]] },
  { id: 2, platform_number: 2901235, project_name: "NOAA", color: "#1E90FF", position: [15, 70], trajectory: [[16, 68], [15.5, 69], [15, 70]] },
  { id: 3, platform_number: 2901236, project_name: "CSIRO", color: "#32CD32", position: [18, 88], trajectory: [[19, 86], [18.5, 87], [18, 88]] },
  { id: 4, platform_number: 2901237, project_name: "JAMSTEC", color: "#FFD700", position: [5, 90], trajectory: [[6, 88], [5.5, 89], [5, 90]] },
  { id: 5, platform_number: 2901238, project_name: "INCOIS", color: "#FF7F50", position: [0, 80], trajectory: [[1, 78], [0.5, 79], [0, 80]] },
  { id: 6, platform_number: 2901239, project_name: "NOAA", color: "#1E90FF", position: [-5, 75], trajectory: [[-4, 73], [-4.5, 74], [-5, 75]] },
  { id: 7, platform_number: 2901240, project_name: "CSIRO", color: "#32CD32", position: [8, 55], trajectory: [[9, 53], [8.5, 54], [8, 55]] },
  { id: 8, platform_number: 2901241, project_name: "JAMSTEC", color: "#FFD700", position: [12, 58], trajectory: [[13, 56], [12.5, 57], [12, 58]] },
];

// This function now simply returns our static data.
export const generateMockFloats = (count = 50) => {
  // We can expand our staticFloats array to have more variety if needed.
  // For now, we'll just repeat the data to reach the desired count.
  const floats = [];
  for (let i = 0; i < count; i++) {
    const float = staticFloats[i % staticFloats.length];
    floats.push({
        ...float,
        id: i + 1, // Ensure unique IDs
        date: new Date(2022, 0, Math.floor(Math.random() * 180) + 1).toISOString().split('T')[0],
        last_cycle: Math.floor(Math.random() * 45) + 5,
    });
  }
  return floats;
};