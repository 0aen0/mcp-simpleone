import type { ResourceType } from '../api/types.js';

/**
 * Типы операций, требующих подтверждения
 */
export type OperationType = 'create' | 'update' | 'delete' | 'run_script';

/**
 * Параметры подтверждения операции
 */
export interface ConfirmationParams {
  operation: OperationType;
  resourceType: ResourceType;
  resourceId?: string;
  description?: string;
  risk?: string;
}

/**
 * Форматирует описание операции для запроса подтверждения
 */
export function formatConfirmationMessage(params: ConfirmationParams): string {
  const operationVerbs: Record<OperationType, string> = {
    create: 'Создание',
    update: 'Обновление',
    delete: 'Удаление',
    run_script: 'Запуск скрипта'
  };

  const resource = params.resourceId 
    ? `${params.resourceType}/${params.resourceId}`
    : params.resourceType;

  let message = `${operationVerbs[params.operation]}: ${resource}`;
  
  if (params.description) {
    message += `\nОписание: ${params.description}`;
  }
  
  if (params.risk) {
    message += `\n⚠️ ${params.risk}`;
  }

  return message;
}

/**
 * Создаёт объект запроса подтверждения
 */
export function createConfirmationRequest(params: ConfirmationParams): {
  requiresConfirmation: true;
  confirmation: {
    operation: string;
    resource: string;
    description?: string;
    risk?: string;
  };
} {
  return {
    requiresConfirmation: true,
    confirmation: {
      operation: params.operation,
      resource: params.resourceId 
        ? `${params.resourceType}/${params.resourceId}`
        : params.resourceType,
      description: params.description,
      risk: params.risk
    }
  };
}

/**
 * Операции, требующие подтверждения (для документации)
 */
export const CONFIRMATION_REQUIRED: OperationType[] = ['create', 'update', 'delete', 'run_script'];
