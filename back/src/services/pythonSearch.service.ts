import axios, { AxiosError } from "axios";
import { Chunk } from "../models/Chunk";
import { RAGSearchResult } from "./ragSearch.service";

export interface PythonSearchRequest {
  query: string;
  mode: "ir" | "rag";
}

export interface PythonSearchResponse {
  answer: string | null;
  results: RAGSearchResult[];
  sources: Array<{
    chunkId: string;
    score: number;
    text: string;
  }>;
}

export interface PythonSearchConfig {
  enabled: boolean;
  apiUrl: string;
  timeout: number;
}

const DEFAULT_CONFIG: PythonSearchConfig = {
  enabled: process.env.PYTHON_API_ENABLED === "true",
  apiUrl: process.env.PYTHON_API_URL || "http://localhost:8000",
  timeout: parseInt(process.env.PYTHON_API_TIMEOUT || "30000", 10),
};

export class PythonSearchService {
  private config: PythonSearchConfig;

  constructor(config?: Partial<PythonSearchConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if Python API is available and configured.
   */
  isAvailable(): boolean {
    return this.config.enabled && !!this.config.apiUrl;
  }

  /**
   * Send search request to Python GPU service.
   * Returns ranked chunk IDs with scores.
   *
   * Throws error if API is unavailable or request fails.
   */
  async search(request: PythonSearchRequest): Promise<PythonSearchResponse> {
    if (!this.isAvailable()) {
      throw new Error("Python search API is not configured or disabled");
    }

    try {
      console.log(
        "Sending request to Python API:",
        request,
        this.config.apiUrl,
      );

      const response = await axios.post<PythonSearchResponse>(
        `${this.config.apiUrl}/search`,
        request,
        {
          timeout: this.config.timeout,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ETIMEDOUT"
        ) {
          throw new Error(
            `Python API connection failed: ${axiosError.message}`,
          );
        }

        if (axiosError.response) {
          throw new Error(
            `Python API error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`,
          );
        }
      }

      throw new Error(
        `Python API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Perform IR search via Python API with fallback to null on failure.
   * Caller should handle null case with local fallback.
   */
  async searchWithFallback(
    request: PythonSearchRequest,
  ): Promise<PythonSearchResponse | null> {
    if (!this.isAvailable()) {
      console.warn("Python search API not available, using local fallback");
      return null;
    }

    try {
      return await this.search(request);
    } catch (error) {
      console.error(
        "Python search failed, using local fallback:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }
}
