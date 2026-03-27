import type { ResourceType } from '../api/types.js';

/**
 * Базовый класс ошибок MCP с контекстом операции
 */
export class McpError extends Error {
  public readonly details?: {
    cause?: unknown;
    operation?: string;
    resourceType?: ResourceType;
    resourceId?: string;
  };

  constructor(
    public readonly code: string,
    message: string,
    details?: {
      cause?: unknown;
      operation?: string;
      resourceType?: ResourceType;
      resourceId?: string;
    }
  ) {
    super(message);
    this.name = 'McpError';
    this.details = details;
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

/**
 * Ошибка подтверждения операции
 */
export class ConfirmationRequiredError extends McpError {
  constructor(
    operation: string,
    resource: string,
    description?: string
  ) {
    super(
      'CONFIRMATION_REQUIRED',
      `Требуется подтверждение для операции "${operation}" с ресурсом "${resource}"`,
      {
        operation,
        cause: { description }
      }
    );
  }
}

/**
 * Ошибка валидации параметров
 */
export class ValidationError extends McpError {
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', `Ошибка валидации поля "${field}": ${message}`, {
      cause: { field }
    });
  }
}

/**
 * Ошибка аутентификации
 */
export class AuthError extends McpError {
  constructor(message: string) {
    super('AUTH_ERROR', `Ошибка аутентификации: ${message}`);
  }
}

/**
 * Ошибка API
 */
export class ApiConnectionError extends McpError {
  constructor(resourceType: ResourceType, cause: unknown) {
    super(
      'API_CONNECTION_ERROR',
      `Не удалось подключиться к SimpleOne API для операции с "${resourceType}"`,
      {
        operation: 'api_call',
        resourceType,
        cause
      }
    );
  }
}

/**
 * Создаёт McpError из неизвестной ошибки
 */
export function toMcpError(error: unknown, context?: { operation?: string; resourceType?: ResourceType }): McpError {
  if (error instanceof McpError) {
    return error;
  }

  if (error instanceof Error) {
    return new McpError(
      'UNKNOWN_ERROR',
      error.message,
      { ...context, cause: error }
    );
  }

  return new McpError(
    'UNKNOWN_ERROR',
    'Произошла неизвестная ошибка',
    context
  );
}
