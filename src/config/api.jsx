// API Configuration
const API_BASE_URL = 'https://artisan-backend-577359325267.us-central1.run.app';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    health: '/health',
    auth: '/api/auth',
    artisan: '/api/artisan',
    ai: '/api/ai'
  }
};

// API Service
export const apiService = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return await response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};
