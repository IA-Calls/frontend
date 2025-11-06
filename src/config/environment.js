// Environment Configuration
const config = {
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // Backend Configuration
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com',
  BACKEND_PORT: process.env.REACT_APP_BACKEND_PORT || '443',
  
  // Twilio Call Service (external service)
  TWILIO_CALL_URL: process.env.REACT_APP_TWILIO_CALL_URL || 'https://twilio-call-754698887417.us-central1.run.app/outbound-call',
  
  // API Endpoints - Constructed from BACKEND_URL
  CLIENTS_PENDING_API_URL: process.env.REACT_APP_CLIENTS_PENDING_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/clients/pending`;
  })(),
  GROUPS_API_URL: process.env.REACT_APP_GROUPS_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/groups`;
  })(),
  AGENTS_API_URL: process.env.REACT_APP_AGENTS_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/agents`;
  })(),
  EXTRACT_EXCEL_API_URL: process.env.REACT_APP_EXTRACT_EXCEL_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/clients/extract-excel`;
  })(),
  OUTBOUND_CALL_PROXY_API_URL: process.env.REACT_APP_OUTBOUND_CALL_PROXY_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/calls/outbound`;
  })(),
  
  // Auth API
  AUTH_API_URL: process.env.REACT_APP_AUTH_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/auth`;
  })(),
  
  // Clients Interested API
  CLIENTS_INTERESTED_API_URL: process.env.REACT_APP_CLIENTS_INTERESTED_API_URL || (() => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.nextvoiceia.com';
    return `${baseUrl}/api/clients/interested`;
  })(),
  
  // Helper methods
  isDevelopment: () => config.ENV === 'development',
  isProduction: () => config.ENV === 'production',
  
  // Get full URL for a specific endpoint
  getApiUrl: (endpoint) => {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${config.BACKEND_URL}${cleanEndpoint}`;
  },
  
  // Get backend URL with port (for local development)
  getBackendUrlWithPort: () => {
    try {
      const url = new URL(config.BACKEND_URL);
      if (config.BACKEND_PORT && config.BACKEND_PORT !== '443' && config.BACKEND_PORT !== '80') {
        url.port = config.BACKEND_PORT;
      }
      return url.toString();
    } catch (error) {
      // Fallback if URL parsing fails
      console.warn('Error parsing BACKEND_URL, using default:', error);
      return config.BACKEND_URL;
    }
  }
};

// Log current environment in development
if (config.isDevelopment()) {
  console.log('🔧 Environment:', config.ENV);
  console.log('🌐 Backend URL:', config.BACKEND_URL);
}

export default config;
