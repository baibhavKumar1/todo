const BaseAIProvider = require('./base-provider');
const { OpenRouter } = require('@openrouter/sdk');

/**
 * OpenRouter AI Provider
 * Implementation of BaseAIProvider for OpenRouter API
 */
class OpenRouterProvider extends BaseAIProvider {
  /**
   * Create a new OpenRouter provider instance
   * @param {Object} config - Provider configuration
   * @param {string} config.apiKey - OpenRouter API key
   * @param {Object} config.options - Additional options
   * @param {string} config.options.referer - HTTP Referer header
   * @param {string} config.options.title - X-Title header
   */
  constructor(config) {
    super(config);
    this.validateConfig();
    this.client = null;
    this.referer = config.options?.referer || 'https://todo.revolute.ai';
    this.title = config.options?.title || 'Revolute Todo App';
  }

  /**
   * Initialize the OpenRouter client
   */
  getClient() {
    if (!this.client) {
      this.client = new OpenRouter({
        apiKey: this.apiKey,
        defaultHeaders: {
          'HTTP-Referer': this.referer,
          'X-Title': this.title,
        },
      });
    }
    return this.client;
  }

  /**
   * Validate OpenRouter-specific configuration
   */
  validateConfig() {
    super.validateConfig();
    if (!this.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenRouter API key format');
    }
    return true;
  }

  /**
   * Generate content using OpenRouter
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt to send to the AI
   * @param {string} params.model - The model to use
   * @param {Object} params.options - Additional generation options
   * @returns {Promise<Object>} The AI response
   */
  async generateContent(params) {
    const { prompt, model, options = {} } = params;

    try {
      const client = this.getClient();

      const response = await client.chat.send({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
        ...options,
      });

      // Return the first choice's message content
      return {
        text: response.choices[0].message.content,
        usage: response.usage,
        model: model,
        provider: 'openrouter'
      };

    } catch (error) {
      console.error('OpenRouterProvider error:', error);
      throw new Error(`OpenRouter generation failed: ${error.message}`);
    }
  }

  /**
   * Generate content as a stream using OpenRouter
   * @param {Object} params - Generation parameters
   * @returns {Promise<ReadableStream>} The response stream
   */
  async generateContentStream(params) {
    const { prompt, model, options = {} } = params;
    const client = this.getClient();

    const response = await client.chat.send({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
      ...options,
    });

    return response; // @openrouter/sdk returns an async iterator/stream
  }

  /**
   * Get provider metadata
   * @returns {Object} Provider information
   */
  getMetadata() {
    return {
      name: 'OpenRouterProvider',
      type: 'openrouter',
      timeout: this.timeout,
      referer: this.referer,
      title: this.title
    };
  }
}

module.exports = OpenRouterProvider;
