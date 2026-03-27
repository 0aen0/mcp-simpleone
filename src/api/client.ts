import axios, { AxiosInstance } from 'axios';
import https from 'node:https';
import { buildAuthHeaders } from './auth.js';
import { logger } from '../utils/logger.js';

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  basicUser?: string;
  basicPassword?: string;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Построение полного URL для SimpleOne Table API
 * Базовый путь: /rest/v1/table/
 */
function buildApiUrl(baseUrl: string): string {
  if (baseUrl.includes('/rest/v1/table')) {
    return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  }
  const path = '/rest/v1/table/';
  return baseUrl.endsWith('/')
    ? baseUrl + path
    : baseUrl + path;
}

/**
 * HTTP-клиент для SimpleOne REST API
 */
export class SimpleOneClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = buildApiUrl(config.baseUrl);
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...buildAuthHeaders(config)
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }

  /**
   * Построение URL для ресурса
   */
  private buildResourceUrl(tableName: string, id?: string): string {
    const table = tableName.startsWith('/') ? tableName.slice(1) : tableName;
    if (id) {
      return `${table}/${id}`;
    }
    return table;
  }

  /**
   * Формирование query строки с правильным кодированием для SimpleOne
   */
  private buildQueryString(params?: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) return '';
    
    // Для SimpleOne важно кодировать только специальные символы, но не ^ и =
    return '?' + Object.entries(params).map(([key, value]) => {
      // Кодируем ключ и значение, но сохраняем ^ и = для условий
      const encodedValue = value
        .split('')
        .map(char => {
          if (char === '^' || char === '=') {
            return char; // Сохраняем операторы
          }
          return encodeURIComponent(char);
        })
        .join('');
      
      return `${encodeURIComponent(key)}=${encodedValue}`;
    }).join('&');
  }

  /**
   * GET запрос с прямым формированием URL
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = this.buildQueryString(params);
    const fullUrl = `${this.baseUrl}${endpoint}${queryString}`;

    logger.trace('GET запрос', { endpoint, params, url: fullUrl });

    try {
      const response = await this.client.get<T>(fullUrl, {
        // Передаём baseURL явно, чтобы axios не добавлял его повторно
        baseURL: undefined
      });

      logger.trace('GET ответ', { endpoint, status: response.status });
      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      logger.error('GET запрос не удался', { endpoint, error: axiosError.message });
      throw error;
    }
  }

  /**
   * POST запрос
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    logger.trace('POST запрос', { endpoint, data });

    try {
      const response = await this.client.post<T>(endpoint, data);
      logger.trace('POST ответ', { endpoint, status: response.status });
      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      logger.error('POST запрос не удался', { endpoint, error: axiosError.message });
      throw error;
    }
  }

  /**
   * PATCH запрос (частичное обновление)
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    logger.trace('PATCH запрос', { endpoint, data });

    try {
      const response = await this.client.patch<T>(endpoint, data);
      logger.trace('PATCH ответ', { endpoint, status: response.status });
      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      logger.error('PATCH запрос не удался', { endpoint, error: axiosError.message });
      throw error;
    }
  }

  /**
   * PUT запрос (полное обновление)
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    logger.trace('PUT запрос', { endpoint, data });

    try {
      const response = await this.client.put<T>(endpoint, data);
      logger.trace('PUT ответ', { endpoint, status: response.status });
      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      logger.error('PUT запрос не удался', { endpoint, error: axiosError.message });
      throw error;
    }
  }

  /**
   * DELETE запрос
   */
  async delete<T>(endpoint: string): Promise<T> {
    logger.trace('DELETE запрос', { endpoint });

    try {
      const response = await this.client.delete<T>(endpoint);
      logger.trace('DELETE ответ', { endpoint, status: response.status });
      return response.data;
    } catch (error) {
      const axiosError = error as Error;
      logger.error('DELETE запрос не удался', { endpoint, error: axiosError.message });
      throw error;
    }
  }

  /**
   * Чтение ресурса (список или по ID)
   */
  async readResource<T>(
    tableName: string,
    id?: string,
    params?: {
      query?: string;
      limit?: number;
      page?: number;
      no_count?: boolean;
      display_value?: string;
      exclude_reference_link?: boolean;
      fields?: string;
      view?: string;
    }
  ): Promise<T | T[]> {
    const url = this.buildResourceUrl(tableName, id);

    const urlParams: Record<string, string> = {};

    if (params?.query) {
      urlParams.sysparm_query = params.query;
    }
    if (params?.limit !== undefined) {
      urlParams.sysparm_limit = params.limit.toString();
    }
    if (params?.page !== undefined) {
      urlParams.sysparm_page = params.page.toString();
    }
    if (params?.no_count !== undefined) {
      urlParams.sysparm_no_count = params.no_count ? 'true' : 'false';
    }
    if (params?.display_value) {
      urlParams.sysparm_display_value = params.display_value;
    }
    if (params?.exclude_reference_link !== undefined) {
      urlParams.sysparm_exclude_reference_link = params.exclude_reference_link ? '1' : '0';
    }
    if (params?.fields) {
      urlParams.sysparm_fields = params.fields;
    }
    if (params?.view) {
      urlParams.sysparm_view = params.view;
    }

    return this.get<T | T[]>(url, urlParams);
  }

  /**
   * Создание ресурса
   */
  async createResource<T>(
    tableName: string,
    data: unknown,
    params?: {
      display_value?: string;
      exclude_reference_link?: boolean;
      fields?: string;
      view?: string;
    }
  ): Promise<T> {
    const url = this.buildResourceUrl(tableName);
    
    const urlParams: Record<string, string> = {};
    if (params?.display_value) {
      urlParams.sysparm_display_value = params.display_value;
    }
    if (params?.exclude_reference_link !== undefined) {
      urlParams.sysparm_exclude_reference_link = params.exclude_reference_link ? '1' : '0';
    }
    if (params?.fields) {
      urlParams.sysparm_fields = params.fields;
    }
    if (params?.view) {
      urlParams.sysparm_view = params.view;
    }
    
    const queryString = this.buildQueryString(urlParams);
    const fullUrl = url + queryString;
    
    return this.post<T>(fullUrl, data);
  }

  /**
   * Обновление ресурса (частичное, PATCH)
   */
  async updateResource<T>(
    tableName: string,
    id: string,
    data: unknown,
    params?: {
      display_value?: string;
      exclude_reference_link?: boolean;
      fields?: string;
      view?: string;
    }
  ): Promise<T> {
    const url = this.buildResourceUrl(tableName, id);

    const urlParams: Record<string, string> = {};
    if (params?.display_value) {
      urlParams.sysparm_display_value = params.display_value;
    }
    if (params?.exclude_reference_link !== undefined) {
      urlParams.sysparm_exclude_reference_link = params.exclude_reference_link ? '1' : '0';
    }
    if (params?.fields) {
      urlParams.sysparm_fields = params.fields;
    }
    if (params?.view) {
      urlParams.sysparm_view = params.view;
    }

    const queryString = this.buildQueryString(urlParams);
    const fullUrl = url + queryString;

    return this.patch<T>(fullUrl, data);
  }

  /**
   * Обновление ресурса (полное, PUT)
   */
  async putResource<T>(
    tableName: string,
    id: string,
    data: unknown,
    params?: {
      display_value?: string;
      exclude_reference_link?: boolean;
      fields?: string;
      view?: string;
    }
  ): Promise<T> {
    const url = this.buildResourceUrl(tableName, id);

    const urlParams: Record<string, string> = {};
    if (params?.display_value) {
      urlParams.sysparm_display_value = params.display_value;
    }
    if (params?.exclude_reference_link !== undefined) {
      urlParams.sysparm_exclude_reference_link = params.exclude_reference_link ? '1' : '0';
    }
    if (params?.fields) {
      urlParams.sysparm_fields = params.fields;
    }
    if (params?.view) {
      urlParams.sysparm_view = params.view;
    }

    const queryString = this.buildQueryString(urlParams);
    const fullUrl = url + queryString;

    return this.put<T>(fullUrl, data);
  }

  /**
   * Удаление ресурса
   */
  async deleteResource(tableName: string, id: string): Promise<void> {
    const url = this.buildResourceUrl(tableName, id);
    await this.delete<void>(url);
  }
}
