import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimpleOneClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import { toMcpError } from '../utils/errors.js';
import { createConfirmationRequest } from '../utils/confirm.js';
import { config } from '../config.js';

/**
 * Схема входных параметров для table_delete
 */
export const tableDeleteInputSchema = {
  type: 'object' as const,
  properties: {
    tableName: {
      type: 'string' as const,
      description: 'Имя таблицы (incident, request, user, problem, change)'
    },
    id: {
      type: 'string' as const,
      description: 'ID записи для удаления'
    },
    confirmed: {
      type: 'boolean' as const,
      description: 'Флаг подтверждения операции (true если пользователь подтвердил)'
    }
  },
  required: ['tableName', 'id']
};

/**
 * Обработчик инструмента table_delete
 * Требует подтверждения перед выполнением
 */
export async function tableDeleteHandler(
  client: SimpleOneClient,
  params: { tableName: string; id: string; confirmed?: boolean }
): Promise<unknown> {
  logger.info('Запрос на удаление ресурса', {
    tableName: params.tableName,
    id: params.id
  });

  // Проверка подтверждения (учитываем SIMPLEONE_AUTO_CONFIRM)
  const shouldConfirm = !params.confirmed && !config.autoConfirm;
  if (shouldConfirm) {
    return createConfirmationRequest({
      operation: 'delete',
      resourceType: params.tableName,
      resourceId: params.id,
      description: `Удаление записи "${params.id}"`,
      risk: 'Данные будут удалены безвозвратно'
    });
  } else if (config.autoConfirm) {
    logger.info('AUTO_CONFIRM включен — удаление без подтверждения');
  }

  try {
    await client.deleteResource(params.tableName, params.id);

    logger.info('Ресурс удалён', {
      tableName: params.tableName,
      id: params.id
    });

    return {
      success: true,
      data: { deleted: true },
      meta: {
        operation: 'esm_delete',
        tableName: params.tableName,
        resourceId: params.id,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const mcpError = toMcpError(error, {
      operation: 'delete',
      resourceType: params.tableName
    });
    logger.error('Ошибка удаления ресурса', {
      tableName: params.tableName,
      id: params.id,
      error: mcpError.message
    });
    throw mcpError;
  }
}

/**
 * Инструмент table_delete
 */
export const tableDeleteTool: Tool = {
  name: 'table_delete',
  description: 'Удаление записи из SimpleOne (ESM). Требует подтверждения пользователя (отключается через SIMPLEONE_AUTO_CONFIRM=true). Данные удаляются безвозвратно.',
  inputSchema: tableDeleteInputSchema
};
