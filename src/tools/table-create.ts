import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimpleOneClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import { toMcpError } from '../utils/errors.js';
import { createConfirmationRequest } from '../utils/confirm.js';
import { config } from '../config.js';

/**
 * Схема входных параметров для table_create
 */
export const tableCreateInputSchema = {
  type: 'object' as const,
  properties: {
    tableName: {
      type: 'string' as const,
      description: 'Имя таблицы (incident, request, user, problem, change)'
    },
    data: {
      type: 'object' as const,
      description: 'Данные для создания записи',
      additionalProperties: true
    },
    confirmed: {
      type: 'boolean' as const,
      description: 'Флаг подтверждения операции (true если пользователь подтвердил)'
    },
    display_value: {
      type: 'string' as const,
      description: 'Возвращать отображаемые значения (true/false/1/0)'
    },
    exclude_reference_link: {
      type: 'boolean' as const,
      description: 'Исключить ссылки для ссылочных полей'
    },
    fields: {
      type: 'string' as const,
      description: 'Список возвращаемых полей (через запятую)'
    },
    view: {
      type: 'string' as const,
      description: 'Представление формы для фильтрации полей'
    }
  },
  required: ['tableName', 'data']
};

/**
 * Обработчик инструмента table_create
 * Требует подтверждения перед выполнением
 */
export async function tableCreateHandler(
  client: SimpleOneClient,
  params: {
    tableName: string;
    data: Record<string, unknown>;
    confirmed?: boolean;
    display_value?: string;
    exclude_reference_link?: boolean;
    fields?: string;
    view?: string;
  }
): Promise<unknown> {
  logger.info('Запрос на создание ресурса', {
    tableName: params.tableName,
    dataKeys: Object.keys(params.data)
  });

  // Проверка подтверждения (учитываем SIMPLEONE_AUTO_CONFIRM)
  const shouldConfirm = !params.confirmed && !config.autoConfirm;
  if (shouldConfirm) {
    logger.warn('Требуется подтверждение операции создания');
    return createConfirmationRequest({
      operation: 'create',
      resourceType: params.tableName,
      description: `Создание записи в "${params.tableName}"`,
      risk: 'Будет создана новая запись в ESM-системе'
    });
  } else if (config.autoConfirm) {
    logger.info('AUTO_CONFIRM включен — создание без подтверждения');
  }

  try {
    const result = await client.createResource(
      params.tableName,
      params.data,
      {
        display_value: params.display_value,
        exclude_reference_link: params.exclude_reference_link,
        fields: params.fields,
        view: params.view
      }
    );
    
    logger.info('Ресурс создан', {
      tableName: params.tableName,
      result: typeof result === 'object' && result !== null && 'id' in result 
        ? { id: (result as Record<string, unknown>).id } 
        : result
    });

    return {
      success: true,
      data: result,
      meta: {
        operation: 'esm_create',
        tableName: params.tableName,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const mcpError = toMcpError(error, {
      operation: 'create',
      resourceType: params.tableName
    });
    logger.error('Ошибка создания ресурса', {
      tableName: params.tableName,
      error: mcpError.message
    });
    throw mcpError;
  }
}

/**
 * Инструмент table_create
 */
export const tableCreateTool: Tool = {
  name: 'table_create',
  description: 'Создание новой записи в SimpleOne (ESM). Требует подтверждения пользователя (отключается через SIMPLEONE_AUTO_CONFIRM=true).',
  inputSchema: tableCreateInputSchema
};
