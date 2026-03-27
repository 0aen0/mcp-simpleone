#!/usr/bin/env node

import { parseArgs } from 'node:util';

/**
 * Точка входа с выбором транспорта
 * --transport stdio | http | sse
 */

const { values } = parseArgs({
  options: {
    transport: {
      type: 'string',
      default: 'stdio'
    },
    port: {
      type: 'string',
      default: '3000'
    }
  },
  args: process.argv.slice(2)
});

const transport = values.transport;
const port = values.port;

if (transport === 'stdio') {
  // Запуск stdio-версии
  void import('./index-stdio.js');
} else if (transport === 'http' || transport === 'sse') {
  // Запуск SSE-версии
  process.env.MCP_PORT = port;
  void import('./index-sse.js');
} else {
  console.error(`Неизвестный транспорт: ${transport}`);
  console.error('Доступные варианты: stdio, http, sse');
  process.exit(1);
}
