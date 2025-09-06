"use client";

import React from 'react';
import { X } from 'lucide-react';

const mockData = [
    { level_id: 8561, profile_id: 8, level_index: 480, pressure_dbar: 964.0, temp: 1.9539999961853027, psal_psu: 34.73500061035156 },
    { level_id: 8562, profile_id: 8, level_index: 481, pressure_dbar: 966.0, temp: 1.9520000219345093, psal_psu: 34.736000061035156 },
    { level_id: 8563, profile_id: 8, level_index: 482, pressure_dbar: 968.0, temp: 1.9520000219345093, psal_psu: 34.736000061035156 },
    { level_id: 8564, profile_id: 8, level_index: 483, pressure_dbar: 970.0, temp: 1.9520000219345093, psal_psu: 34.736000061035156 },
    { level_id: 8565, profile_id: 8, level_index: 484, pressure_dbar: 972.0, temp: 1.9509999752044678, psal_psu: 34.736000061035156 },
    { level_id: 8566, profile_id: 8, level_index: 485, pressure_dbar: 974.0, temp: 1.9490000009536743, psal_psu: 34.736000061035156 },
    { level_id: 8567, profile_id: 8, level_index: 486, pressure_dbar: 976.0, temp: 1.9459999799728394, psal_psu: 34.736000061035156 }
];

const latLonData = [
    { id: 1, lat: '12.467', lon: '75.001' },
    { id: 2, lat: '12.467', lon: '75.002' },
    { id: 3, lat: '12.467', lon: '75.003' },
    { id: 4, lat: '12.466', lon: '75.004' },
    { id: 5, lat: '12.463', lon: '75.005' },
    { id: 6, lat: '12.462', lon: '75.006' },
    { id: 7, lat: '12.464', lon: '75.007' },
];

export default function ChatDataViewer({ dataType, onClose }) {
    let title = "";
    let columns = [];
    let dataToDisplay = [];

    switch (dataType) {
        case 'Temperature':
            title = "Temperature Data";
            columns = [
                { name: 'Level ID', key: 'level_id' },
                { name: 'Profile ID', key: 'profile_id' },
                { name: 'Temperature (°C)', key: 'temp' }
            ];
            dataToDisplay = mockData;
            break;
        case 'Salinity':
            title = "Salinity Data";
            columns = [
                { name: 'Level ID', key: 'level_id' },
                { name: 'Profile ID', key: 'profile_id' },
                { name: 'Salinity (PSU)', key: 'psal_psu' }
            ];
            dataToDisplay = mockData;
            break;
        case 'Pressure':
            title = "Pressure Data";
            columns = [
                { name: 'Level ID', key: 'level_id' },
                { name: 'Profile ID', key: 'profile_id' },
                { name: 'Pressure (dbar)', key: 'pressure_dbar' }
            ];
            dataToDisplay = mockData;
            break;
        case 'Lat & Lon':
            title = "Lat & Lon Data";
            columns = [
                { name: 'ID', key: 'id' },
                { name: 'Latitude', key: 'lat' },
                { name: 'Longitude', key: 'lon' }
            ];
            dataToDisplay = latLonData;
            break;
        default:
            return <div className="flex items-center justify-center h-full"><p>No data type selected.</p></div>;
    }

    const getDataSpecificHeaderStyles = (type) => {
        switch (type) {
            case 'Temperature':
                return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 dark:bg-gradient-to-r dark:from-red-900 dark:to-orange-900 dark:text-gray-100';
            case 'Salinity':
                return 'bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 dark:bg-gradient-to-r dark:from-blue-900 dark:to-teal-900 dark:text-gray-100';
            case 'Pressure':
                return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:bg-gradient-to-r dark:from-purple-900 dark:to-pink-900 dark:text-gray-100';
            case 'Lat & Lon':
                return 'bg-gradient-to-r from-green-100 to-lime-100 text-green-800 dark:bg-gradient-to-r dark:from-green-900 dark:to-lime-900 dark:text-gray-100';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 dark:text-gray-100';
        }
    };

    return (
        <div className="relative h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 border border-white/10 dark:border-gray-800/20 p-6 sm:p-8 animate-fade-in flex flex-col items-center justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Close Data Viewer">
                <X size={20} />
            </button>
            
            <div className="w-full max-w-2xl rounded-lg shadow-xl overflow-hidden animate-plot-appear bg-card dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800">
                <h3 className="text-center text-xl font-extrabold p-4 pb-2 text-gray-800 dark:text-gray-50">{title}</h3>
                <div className="overflow-x-auto p-4 max-h-[calc(100vh-250px)]">
                    <table className="min-w-full text-sm rounded-lg">
                        <thead className={`sticky top-0 border-b ${getDataSpecificHeaderStyles(dataType)}`}>
                            <tr className="text-left">
                                {columns.map(col => (
                                    <th key={col.key} className="p-3 text-base font-bold">{col.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dataToDisplay.map((row, index) => (
                                <tr key={index} className={`border-b dark:border-gray-700 hover:bg-muted/50 transition-colors
                                  ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-transparent'}`}
                                >
                                    {columns.map(col => (
                                        <td key={`${index}-${col.key}`} className="p-3 text-gray-700 dark:text-gray-200">
                                            {typeof row[col.key] === 'number' ? row[col.key].toFixed(2) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}