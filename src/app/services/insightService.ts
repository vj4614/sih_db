// A mock service to identify when to trigger a dynamic insight from a user's query.

// Define the structure for our insight metadata
export interface Insight {
    id: string;
    title: string;
    subtitle: string;
    query: string; // The user query that triggered this
  }
  
  // Keywords that will trigger a specific insight
  const INSIGHT_TRIGGERS: { [key: string]: string[] } = {
    'hidden-heatwaves': [
      'heatwave', 'subsurface', 'warming', 'anomaly', 'analyze indian ocean temperature'
    ],
    // Add more triggers for other insights here
    // 'cyclone-fingerprints': ['cyclone', 'storm', 'cooling effect'],
  };
  
  // The metadata for the insights we can trigger
  const INSIGHT_METADATA: Omit<Insight, 'query'>[] = [
      {
          id: "hidden-heatwaves",
          title: "Dynamic Insight: Hidden Subsurface Heatwaves",
          subtitle: "Detecting thermal anomalies at 50–150 m that satellites miss.",
      },
      // Add metadata for other insights here
  ];
  
  
  /**
   * Checks a user's message to see if it should trigger a dynamic insight.
   * @param message The user's chat message.
   * @returns The corresponding Insight object if a trigger keyword is found, otherwise null.
   */
  export const getInsightForQuery = (message: string): Insight | null => {
    const lowerCaseMessage = message.toLowerCase();
  
    for (const insightId in INSIGHT_TRIGGERS) {
      const keywords = INSIGHT_TRIGGERS[insightId];
      if (keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
        const metadata = INSIGHT_METADATA.find(m => m.id === insightId);
        if (metadata) {
          return { ...metadata, query: message }; // Return the full insight object
        }
      }
    }
  
    return null; // No trigger found
  };