export interface AuthConfig {
  apiKey?: string;
  basicUser?: string;
  basicPassword?: string;
}

/**
 * Строит заголовки аутентификации для SimpleOne API
 * Приоритет: API-ключ > Basic Auth
 */
export function buildAuthHeaders(config: AuthConfig): Record<string, string> {
  if (config.apiKey) {
    // SimpleOne принимает токен (auth_key из /rest/v1/auth/login) только как Bearer;
    // заголовок X-API-Key инстанс отвергает с 401.
    return {
      'Authorization': `Bearer ${config.apiKey}`
    };
  }
  
  if (config.basicUser && config.basicPassword) {
    const credentials = `${config.basicUser}:${config.basicPassword}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return {
      'Authorization': `Basic ${base64Credentials}`
    };
  }
  
  throw new Error('Аутентификация не настроена: требуется API-ключ или Basic Auth');
}

/**
 * Проверяет наличие конфигурации аутентификации
 */
export function hasAuthConfig(config: AuthConfig): boolean {
  return !!(config.apiKey || (config.basicUser && config.basicPassword));
}

/**
 * Маскирует чувствительные данные для логирования
 */
export function sanitizeAuthConfig(config: AuthConfig): Record<string, string> {
  return {
    apiKey: config.apiKey ? '***' : 'не задан',
    basicUser: config.basicUser ? '***' : 'не задан',
    basicPassword: config.basicPassword ? '***' : 'не задан'
  };
}
