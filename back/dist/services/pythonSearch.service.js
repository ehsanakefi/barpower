"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonSearchService = void 0;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_CONFIG = {
    enabled: process.env.PYTHON_API_ENABLED === 'true',
    apiUrl: process.env.PYTHON_API_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.PYTHON_API_TIMEOUT || '30000', 10),
};
class PythonSearchService {
    constructor(config) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Check if Python API is available and configured.
     */
    isAvailable() {
        return this.config.enabled && !!this.config.apiUrl;
    }
    /**
     * Send search request to Python GPU service.
     * Returns ranked chunk IDs with scores.
     *
     * Throws error if API is unavailable or request fails.
     */
    async search(request) {
        if (!this.isAvailable()) {
            throw new Error('Python search API is not configured or disabled');
        }
        try {
            const response = await axios_1.default.post(`${this.config.apiUrl}/search`, request, {
                timeout: this.config.timeout,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ETIMEDOUT') {
                    throw new Error(`Python API connection failed: ${axiosError.message}`);
                }
                if (axiosError.response) {
                    throw new Error(`Python API error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`);
                }
            }
            throw new Error(`Python API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Perform IR search via Python API with fallback to null on failure.
     * Caller should handle null case with local fallback.
     */
    async searchWithFallback(request) {
        if (!this.isAvailable()) {
            console.warn('Python search API not available, using local fallback');
            return null;
        }
        try {
            return await this.search(request);
        }
        catch (error) {
            console.error('Python search failed, using local fallback:', error instanceof Error ? error.message : error);
            return null;
        }
    }
}
exports.PythonSearchService = PythonSearchService;
