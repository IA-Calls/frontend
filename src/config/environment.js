// Environment Configuration
const config = {
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // Backend URLs
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  TWILIO_CALL_URL: process.env.REACT_APP_TWILIO_CALL_URL || 'https://twilio-call-754698887417.us-central1.run.app/outbound-call',
  
  // API Endpoints
  CLIENTS_PENDING_API_URL: process.env.REACT_APP_CLIENTS_PENDING_API_URL || 'http://localhost:5000/api/clients/pending',
  GROUPS_API_URL: process.env.REACT_APP_GROUPS_API_URL || 'http://localhost:5000/api/groups',
  AGENTS_API_URL: process.env.REACT_APP_AGENTS_API_URL || 'http://localhost:5000/api/agents',
  EXTRACT_EXCEL_API_URL: process.env.REACT_APP_EXTRACT_EXCEL_API_URL || 'http://localhost:5000/api/clients/extract-excel',
  OUTBOUND_CALL_PROXY_API_URL: process.env.REACT_APP_OUTBOUND_CALL_PROXY_API_URL || 'http://localhost:5000/api/calls/outbound',
  
  // Helper methods
  isDevelopment: () => config.ENV === 'development',
  isProduction: () => config.ENV === 'production',
  
  // Get full URL for a specific endpoint
  getApiUrl: (endpoint) => {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${config.BACKEND_URL}${endpoint}`;
  }
};

// Log current environment in development
if (config.isDevelopment()) {
  console.log('🔧 Environment:', config.ENV);
  console.log('🌐 Backend URL:', config.BACKEND_URL);
}

export default config;
