import { useState } from 'react';

// Defines the types of metrics the user can select.
export type PreviewMetric = 'Temperature' | 'Salinity' | 'Humidity';

/**
 * A custom hook to manage the currently selected preview metric.
 * This provides a centralized state that can be shared across components.
 * @returns An object containing the current `previewMetric` and a function `setPreviewMetric` to update it.
 */
export function usePreviewMetric() {
  const [previewMetric, setPreviewMetric] = useState<PreviewMetric>('Temperature');

  return {
    previewMetric,
    setPreviewMetric,
  };
}