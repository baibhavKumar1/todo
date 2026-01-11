/**
 * Base AI Provider Interface
 * Defines the contract that all AI providers must implement
 */

class BaseAIProvider {
  /**
   * Create a new AI provider instance
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - API key for the provider
   * @param {Object} config.options - Additional provider-specific options
   */
  constructor(config) {
    if (new.target === BaseAIProvider) {
      throw new Error('BaseAIProvider cannot be instantiated directly');
    }
    this.apiKey = config.apiKey;
    this.options = config.options || {};
    this.timeout = config.timeout || 120000; // 120 seconds default timeout
  }

  /**
   * Generate content using the AI provider
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt to send to the AI
   * @param {string} params.model - The model to use
   * @param {Object} params.options - Additional generation options
   * @returns {Promise<Object>} The AI response
   */
  async generateContent(params) {
    throw new Error('generateContent method must be implemented by subclass');
  }

  /**
   * Validate the provider configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }
    return true;
  }

  /**
   * Get provider metadata
   * @returns {Object} Provider information
   */
  getMetadata() {
    return {
      name: this.constructor.name,
      type: 'base',
      timeout: this.timeout
    };
  }
}

module.exports = BaseAIProvider;
