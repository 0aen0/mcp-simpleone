import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { tableCreateTool, tableCreateHandler } from './table-create.js';
import { tableReadTool, tableReadHandler } from './table-read.js';
import { tableUpdateTool, tableUpdateHandler } from './table-update.js';
import { tableDeleteTool, tableDeleteHandler } from './table-delete.js';

/**
 * Все MCP инструменты для SimpleOne
 */
export const tools: Tool[] = [
  tableCreateTool,
  tableReadTool,
  tableUpdateTool,
  tableDeleteTool
];

/**
 * Карта обработчиков инструментов
 */
export interface ToolHandlers {
  table_create: typeof tableCreateHandler;
  table_read: typeof tableReadHandler;
  table_update: typeof tableUpdateHandler;
  table_delete: typeof tableDeleteHandler;
}

export const toolHandlers: ToolHandlers = {
  table_create: tableCreateHandler,
  table_read: tableReadHandler,
  table_update: tableUpdateHandler,
  table_delete: tableDeleteHandler
};

/**
 * Получает обработчик по имени инструмента
 */
export function getToolHandler(name: string): ToolHandlers[keyof ToolHandlers] | undefined {
  return toolHandlers[name as keyof ToolHandlers];
}
