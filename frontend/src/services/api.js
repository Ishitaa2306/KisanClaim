/**
 * Dedicated API service layer for KisanClaim frontend.
 * Assumes Vite proxy redirects /api to backend localhost:3000
 */

// Generic fetch wrapper for clean error handling
async function fetchApi(endpoint) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    return data.data; // The backend wraps response in a 'data' object
  } catch (error) {
    console.error(`[API Error] GET ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  /**
   * Get paginated farms list with optional filters
   */
  getFarms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/v1/farms?${query}` : `/api/v1/farms`;
    // The backend getAll returns { farms } inside data? Wait, checking the response structure in logs:
    // the backend uses new ApiResponse(200, '...', result.farms, { ...meta })
    // actually, wait, the backend controller says:
    // new ApiResponse(200, '...', result.farms, { ...meta, aggregates })
    // so data is the array of farms.
    // Let's implement fetch directly
    const response = await fetch(endpoint);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result; 
  },

  /**
   * Get single farm intelligence report
   */
  getFarmById: async (id) => {
    return fetchApi(`/api/v1/farms/${id}`);
  },

  /**
   * Get dashboard intelligence stats
   */
  getStats: async () => {
    return fetchApi('/api/v1/farms/stats/intelligence');
  },

  /**
   * Get risk matrix aggregation data
   */
  getRiskData: async (level) => {
    return fetchApi(level ? `/api/v1/risk?level=${level}` : '/api/v1/risk');
  },

  /**
   * Get system activity and error logs
   */
  getSystemLogs: async () => {
    return fetchApi('/api/v1/activity');
  },

  /**
   * Get regional weather forecast data
   */
  getWeatherData: async () => {
    return fetchApi('/api/v1/weather');
  },

  /**
   * Get Map coordinates
   */
  getMapData: async () => {
    return fetchApi('/api/v1/map');
  },

  /**
   * Get all submitted claims
   */
  getClaims: async () => {
    return fetchApi('/api/claims');
  },

  /**
   * Get a single claim by ID — uses the SAME stored data as the list view
   */
  getClaimById: async (id) => {
    return fetchApi(`/api/claim/${id}`);
  },

  /**
   * Update status of a specific claim
   */
  updateClaimStatus: async (id, status) => {
    try {
      const response = await fetch(`/api/claim/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `API Error: ${response.status}`);
      return data.data;
    } catch (error) {
      console.error(`[API Error] PATCH /api/claim/${id}:`, error);
      throw error;
    }
  },

  /**
   * Get detailed intelligence report for a farm
   */
  getFarmReport: async (id) => {
    return fetchApi(`/api/v1/report/${id}`);
  },

  /**
   * Get intelligent risk analysis for a specific farm (Weather Intelligence Engine)
   */
  getFarmAnalysis: async (id) => {
    return fetchApi(`/api/farm/${id}/analysis`);
  },

  /**
   * Get ground evidence images uploaded for a farm
   */
  getFarmImages: async (id) => {
    return fetchApi(`/api/farm/${id}/images`);
  }
};
