const OpenRouterProvider = require('./openrouter-provider');

/**
 * AI Provider Factory
 * Manages provider instantiation and fallback logic
 */
class ProviderFactory {
  /**
   * Create a new ProviderFactory instance
   * @param {Object} config - Factory configuration
   */
  constructor(config = {}) {
    this.primaryProvider = 'openrouter';
    this.providers = config.providers || {};
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 2;
  }

  /**
   * Get a provider instance
   * @param {string} providerName - Name of provider to get
   * @returns {BaseAIProvider} Provider instance
   */
  getProvider(providerName) {
    const providerConfig = this.providers[providerName];
    if (!providerConfig) {
      throw new Error(`Provider configuration not found: ${providerName}`);
    }

    switch (providerName) {
      case 'openrouter':
        return new OpenRouterProvider(providerConfig);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  /**
   * Generate content with automatic retry
   */
  async generateContent(params) {
    const { prompt, model, options = {} } = params;
    let lastError = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const provider = this.getProvider(this.primaryProvider);
        const result = await this._generateWithTimeout(
          provider,
          { prompt, model, options },
          this.timeout
        );

        return {
          ...result,
          providerUsed: 'openrouter',
          attempt: attempt + 1
        };
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      }
    }

    throw new Error(`Generation failed after ${this.maxRetries} retries. Last error: ${lastError?.message}`);
  }

  /**
   * Generate content as a stream
   */
  async generateContentStream(params) {
    const provider = this.getProvider(this.primaryProvider);
    return provider.generateContentStream(params);
  }

  /**
   * Generate content with timeout
   * @private
   */
  async _generateWithTimeout(provider, params, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Provider ${provider.getMetadata().name} timed out after ${timeout}ms`));
      }, timeout);

      provider.generateContent(params)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}

/**
 * Create a default provider factory
 */
function createDefaultProviderFactory() {
  const providers = {};

  if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
    providers.openrouter = {
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
      options: {
        referer: process.env.OPENROUTER_REFERER || 'https://todo.revolute.ai',
        title: process.env.OPENROUTER_TITLE || 'Revolute Todo App'
      }
    };
  }

  return new ProviderFactory({
    providers: providers,
    timeout: process.env.AI_TIMEOUT_MS ? parseInt(process.env.AI_TIMEOUT_MS) : 30000,
    maxRetries: process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES) : 2
  });
}

module.exports = {
  ProviderFactory,
  createDefaultProviderFactory
};
