import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimpleOneClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import { toMcpError } from '../utils/errors.js';
import { createConfirmationRequest } from '../utils/confirm.js';
import { config } from '../config.js';

/**
 * Схема входных параметров для table_update
 */
export const tableUpdateInputSchema = {
  type: 'object' as const,
  properties: {
    tableName: {
      type: 'string' as const,
      description: 'Имя таблицы (incident, request, user, problem, change)'
    },
    id: {
      type: 'string' as const,
      description: 'ID записи для обновления'
    },
    data: {
      type: 'object' as const,
      description: 'Поля для обновления',
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
  required: ['tableName', 'id', 'data']
};

/**
 * Обработчик инструмента table_update
 * Требует подтверждения перед выполнением
 */
export async function tableUpdateHandler(
  client: SimpleOneClient,
  params: {
    tableName: string;
    id: string;
    data: Record<string, unknown>;
    confirmed?: boolean;
    display_value?: string;
    exclude_reference_link?: boolean;
    fields?: string;
    view?: string;
  }
): Promise<unknown> {
  logger.info('Запрос на обновление ресурса', {
    tableName: params.tableName,
    id: params.id,
    dataKeys: Object.keys(params.data)
  });

  // Проверка подтверждения (учитываем SIMPLEONE_AUTO_CONFIRM)
  const shouldConfirm = !params.confirmed && !config.autoConfirm;
  if (shouldConfirm) {
    const updateFields = Object.keys(params.data).join(', ');
    return createConfirmationRequest({
      operation: 'update',
      resourceType: params.tableName,
      resourceId: params.id,
      description: `Обновление полей: ${updateFields}`,
      risk: 'Данные в ESM-системе будут изменены'
    });
  } else if (config.autoConfirm) {
    logger.info('AUTO_CONFIRM включен — обновление без подтверждения');
  }

  try {
    const result = await client.updateResource(
      params.tableName,
      params.id,
      params.data,
      {
        display_value: params.display_value,
        exclude_reference_link: params.exclude_reference_link,
        fields: params.fields,
        view: params.view
      }
    );
    
    logger.info('Ресурс обновлён', {
      tableName: params.tableName,
      id: params.id
    });

    return {
      success: true,
      data: result,
      meta: {
        operation: 'esm_update',
        tableName: params.tableName,
        resourceId: params.id,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const mcpError = toMcpError(error, {
      operation: 'update',
      resourceType: params.tableName
    });
    logger.error('Ошибка обновления ресурса', {
      tableName: params.tableName,
      id: params.id,
      error: mcpError.message
    });
    throw mcpError;
  }
}

/**
 * Инструмент table_update
 */
export const tableUpdateTool: Tool = {
  name: 'table_update',
  description: 'Обновление существующей записи в SimpleOne (ESM). Требует подтверждения пользователя (отключается через SIMPLEONE_AUTO_CONFIRM=true).',
  inputSchema: tableUpdateInputSchema
};
