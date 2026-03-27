#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config, getSanitizedConfig, version } from './config.js';
import { SimpleOneClient } from './api/client.js';
import { tools, getToolHandler } from './tools/index.js';
import { logger } from './utils/logger.js';
import { McpError } from './utils/errors.js';

/**
 * Основная точка входа MCP-сервера SimpleOne (stdio-транспорт)
 */
async function main(): Promise<void> {
  logger.info('Запуск SimpleOne MCP-сервера (stdio режим)');
  logger.info('Конфигурация:', getSanitizedConfig());

  // Создание клиента SimpleOne
  const client = new SimpleOneClient({
    baseUrl: config.simpleOneUrl,
    apiKey: config.apiKey,
    basicUser: config.basicUser,
    basicPassword: config.basicPassword,
    timeout: config.timeout
  });

  // Создание MCP сервера
  const server = new Server(
    {
      name: 'mcp-simpleone',
      version
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Обработчик запроса списка инструментов
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Запрос списка инструментов');
    return { tools };
  });

  // Обработчик вызова инструментов
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('Вызов инструмента', { name, hasArgs: !!args });

    try {
      const handler = getToolHandler(name);

      if (!handler) {
        throw new McpError('TOOL_NOT_FOUND', `Инструмент "${name}" не найден`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (handler as any)(client, args as Record<string, unknown>);
      
      // Если результат требует подтверждения, возвращаем как есть
      if (typeof result === 'object' && result !== null && 'requiresConfirmation' in result) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      // Обычный успешный результат
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof McpError 
        ? error.message 
        : `Неизвестная ошибка: ${error instanceof Error ? error.message : String(error)}`;
      
      logger.error('Ошибка выполнения инструмента', {
        name,
        error: errorMessage
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: {
                code: error instanceof McpError ? error.code : 'UNKNOWN_ERROR',
                message: errorMessage
              }
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  // Запуск сервера
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('MCP-сервер запущен и готов к приёму запросов');
}

// Обработка неза пойманных ошибок
process.on('uncaughtException', (error) => {
  logger.error('Непойманное исключение', { error: error.message });
  void process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Необработанное обещание', { reason: String(reason) });
  void process.exit(1);
});

// Запуск
main().catch((error) => {
  logger.error('Ошибка запуска сервера', { error: error.message });
  void process.exit(1);
});
