import { authService } from './authService';
import config from '../config/environment.js';

export class WhatsAppTemplatesService {
  constructor() {
    this.apiUrl = config.WHATSAPP_TEMPLATES_API_URL;
  }

  /**
   * Obtener lista de templates con filtros
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.status - Estado del template (APPROVED, PENDING, REJECTED)
   * @param {string} params.language - Idioma del template (es, en, etc.)
   * @returns {Promise<Array>} Lista de templates
   */
  async getTemplates(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar wabaId siempre
      queryParams.append('wabaId', '845940141538253');
      
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.language && params.language !== 'all') queryParams.append('language', params.language);

      const url = `${this.apiUrl}?${queryParams.toString()}`;
      
      console.log('WhatsAppTemplatesService - Making request to:', url);
      
      const response = await authService.authenticatedFetch(url);
      console.log('WhatsAppTemplatesService - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('WhatsAppTemplatesService - Error response:', errorData);
        throw new Error(errorData.message || 'Error al obtener templates');
      }

      const responseData = await response.json();
      console.log('WhatsAppTemplatesService - Response data:', responseData);
      
      // Extraer datos de la respuesta
      return responseData.data || responseData;
    } catch (error) {
      console.error('WhatsAppTemplatesService - Error:', error);
      throw error;
    }
  }

  /**
   * Obtener un template específico por ID
   * @param {string} templateId - ID del template
   * @returns {Promise<Object>} Template
   */
  async getTemplate(templateId) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('wabaId', '845940141538253');
      
      const url = `${this.apiUrl}/${templateId}?${queryParams.toString()}`;
      console.log('WhatsAppTemplatesService - Making request to:', url);
      
      const response = await authService.authenticatedFetch(url);
      console.log('WhatsAppTemplatesService - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('WhatsAppTemplatesService - Error response:', errorData);
        throw new Error(errorData.message || 'Error al obtener template');
      }

      const responseData = await response.json();
      console.log('WhatsAppTemplatesService - Response data:', responseData);
      
      // Extraer datos de la respuesta
      return responseData.data || responseData;
    } catch (error) {
      console.error('WhatsAppTemplatesService - Error:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo template
   * @param {Object} templateData - Datos del template
   * @param {string} templateData.name - Nombre del template
   * @param {string} templateData.language - Idioma del template
   * @param {string} templateData.category - Categoría (marketing, utility, authentication)
   * @param {Array} templateData.components - Componentes del template
   * @returns {Promise<Object>} Template creado
   */
  async createTemplate(templateData) {
    try {
      // Preparar componentes - solo enviar type y text, sin example si está vacío
      const components = templateData.components.map(comp => {
        const component = {
          type: comp.type,
          text: comp.text
        }
        
        // Solo agregar format si es header y tiene formato
        if (comp.type === "header" && comp.format) {
          component.format = comp.format
        }
        
        return component
      })
      
      // Agregar wabaId al payload (NO accessToken - se toma del .env automáticamente)
      const templatePayload = {
        name: templateData.name,
        language: templateData.language,
        category: templateData.category,
        components: components,
        wabaId: "845940141538253"
      };
      
      console.log('WhatsAppTemplatesService - Creating template:', templatePayload);
      
      const response = await authService.authenticatedFetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templatePayload),
      });
      
      console.log('WhatsAppTemplatesService - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('WhatsAppTemplatesService - Error response:', errorData);
        throw new Error(errorData.message || 'Error al crear template');
      }

      const responseData = await response.json();
      console.log('WhatsAppTemplatesService - Response data:', responseData);
      
      // Extraer datos de la respuesta
      return responseData.data || responseData;
    } catch (error) {
      console.error('WhatsAppTemplatesService - Error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un template
   * @param {string} templateId - ID del template
   * @returns {Promise<Object>} Respuesta de eliminación
   */
  async deleteTemplate(templateId) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('wabaId', '845940141538253');
      
      const url = `${this.apiUrl}/${templateId}?${queryParams.toString()}`;
      console.log('WhatsAppTemplatesService - Deleting template:', url);
      
      const response = await authService.authenticatedFetch(url, {
        method: 'DELETE',
      });
      
      console.log('WhatsAppTemplatesService - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('WhatsAppTemplatesService - Error response:', errorData);
        throw new Error(errorData.message || 'Error al eliminar template');
      }

      const responseData = await response.json().catch(() => ({ success: true }));
      console.log('WhatsAppTemplatesService - Response data:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('WhatsAppTemplatesService - Error:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const whatsappTemplatesService = new WhatsAppTemplatesService();

