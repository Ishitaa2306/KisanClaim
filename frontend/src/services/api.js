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
  }
};
