import express, { Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config, getSanitizedConfig, version } from './config.js';
import { SimpleOneClient } from './api/client.js';
import { tools, getToolHandler } from './tools/index.js';
import { logger } from './utils/logger.js';
import { McpError } from './utils/errors.js';

/**
 * MCP-сервер с SSE-транспортом для сетевого доступа
 * Порт: 3000 (по умолчанию)
 */

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000;
const app = express();

// Хранилище сессий: sessionId -> transport
const sessions = new Map<string, SSEServerTransport>();

logger.info('Запуск SimpleOne MCP-сервера (SSE режим)');
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

// Middleware для парсинга JSON
app.use(express.json());

/**
 * SSE endpoint - подключение клиента
 */
app.get('/sse', async (_req: express.Request, res: Response) => {
  logger.info('Новое SSE подключение');

  const transport = new SSEServerTransport('/message', res);
  sessions.set(transport.sessionId, transport);

  res.on('close', () => {
    logger.info('SSE подключение закрыто', { sessionId: transport.sessionId });
    void sessions.delete(transport.sessionId);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises
    void server.close().catch(() => {});
  });

  await server.connect(transport);
});

/**
 * Message endpoint - получение сообщений от клиента
 */
app.post('/message', async (req: express.Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId required' });
    return;
  }

  const transport = sessions.get(sessionId);

  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises
  void transport.handlePostMessage(req, res, req.body).catch(() => {});
});

/**
 * Health check endpoint
 */
app.get('/health', (_req: express.Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'mcp-simpleone',
    version,
    sessions: sessions.size
  });
});

/**
 * Info endpoint - информация о сервере
 */
app.get('/info', (_req: express.Request, res: Response) => {
  res.json({
    name: 'mcp-simpleone',
    version,
    description: 'MCP-сервер для SimpleOne (ESM)',
    tools: tools.map(t => ({
      name: t.name,
      description: t.description
    })),
    config: getSanitizedConfig()
  });
});

// Запуск сервера
app.listen(PORT, () => {
  logger.info(`MCP-сервер запущен на порту ${PORT}`);
  logger.info(`SSE endpoint: http://localhost:${PORT}/sse`);
  logger.info(`Message endpoint: http://localhost:${PORT}/message`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Info: http://localhost:${PORT}/info`);
});

// Обработка неза пойманных ошибок
process.on('uncaughtException', (error) => {
  logger.error('Непойманное исключение', { error: error.message });
  void process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Необработанное обещание', { reason: String(reason) });
  void process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Получен SIGINT, завершение работы...');
  sessions.forEach((transport) => {
    transport.close();
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises
  void server.close().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Получен SIGTERM, завершение работы...');
  sessions.forEach((transport) => {
    transport.close();
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises
  void server.close().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(0);
  });
});
