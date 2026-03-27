import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SimpleOneClient } from '../api/client.js';
import { logger } from '../utils/logger.js';
import { toMcpError } from '../utils/errors.js';

/**
 * Схема входных параметров для table_read
 */
export const tableReadInputSchema = {
  type: 'object' as const,
  properties: {
    tableName: {
      type: 'string' as const,
      description: 'Имя таблицы (incident, request, user, problem, change)'
    },
    id: {
      type: 'string' as const,
      description: 'ID записи (опционально, если нет — вернётся список)'
    },
    query: {
      type: 'string' as const,
      description: 'Закодированная строка фильтрации (например, "active=1^priority=2")'
    },
    limit: {
      type: 'number' as const,
      description: 'Максимальное количество результатов (по умолчанию 20)'
    },
    page: {
      type: 'number' as const,
      description: 'Номер страницы для пагинации (по умолчанию 1)'
    },
    no_count: {
      type: 'boolean' as const,
      description: 'Отключить подсчёт общего количества записей (для оптимизации)'
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
  required: ['tableName']
};

/**
 * Обработчик инструмента table_read
 * Чтение не требует подтверждения
 */
export async function tableReadHandler(
  client: SimpleOneClient,
  params: {
    tableName: string;
    id?: string;
    query?: string;
    limit?: number;
    page?: number;
    no_count?: boolean;
    display_value?: string;
    exclude_reference_link?: boolean;
    fields?: string;
    view?: string;
  }
): Promise<unknown> {
  logger.info('Чтение ресурса', {
    tableName: params.tableName,
    id: params.id,
    hasQuery: !!params.query,
    queryType: typeof params.query,
    queryValue: params.query,
    allParams: params
  });

  try {
    const result = await client.readResource(
      params.tableName,
      params.id,
      {
        query: typeof params.query === 'string' ? params.query : undefined,
        limit: params.limit,
        page: params.page,
        no_count: params.no_count,
        display_value: params.display_value,
        exclude_reference_link: params.exclude_reference_link,
        fields: params.fields,
        view: params.view
      }
    );
    
    const items = Array.isArray(result) ? result : [result];
    logger.info('Ресурс прочитан', {
      tableName: params.tableName,
      id: params.id,
      count: items.length
    });
    
    return {
      success: true,
      data: items,
      meta: {
        operation: 'esm_read',
        tableName: params.tableName,
        resourceId: params.id,
        count: items.length,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const mcpError = toMcpError(error, {
      operation: 'read',
      resourceType: params.tableName
    });
    logger.error('Ошибка чтения ресурса', {
      tableName: params.tableName,
      error: mcpError.message
    });
    throw mcpError;
  }
}

/**
 * Инструмент table_read
 */
export const tableReadTool: Tool = {
  name: 'table_read',
  description: 'Чтение записи из SimpleOne (ESM) по ID или списка записей. Не требует подтверждения.',
  inputSchema: tableReadInputSchema
};
