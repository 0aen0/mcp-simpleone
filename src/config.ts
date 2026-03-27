import dotenv from 'dotenv';
import { z } from 'zod';
import pkg from '../package.json' with { type: 'json' };

dotenv.config();

const configSchema = z.object({
  simpleOneUrl: z.string().url('SIMPLEONE_URL должен быть валидным URL'),
  apiKey: z.string().optional(),
  basicUser: z.string().optional(),
  basicPassword: z.string().optional(),
  timeout: z.string().transform(Number).default('30000'),
  autoConfirm: z.string().transform((val) => val === 'true').default('false')
}).refine(
  (data) => data.apiKey || (data.basicUser && data.basicPassword),
  'Требуется API-ключ ИЛИ Basic Auth (SIMPLEONE_BASIC_USER и SIMPLEONE_BASIC_PASSWORD)'
);

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    simpleOneUrl: process.env.SIMPLEONE_URL,
    apiKey: process.env.SIMPLEONE_API_KEY,
    basicUser: process.env.SIMPLEONE_BASIC_USER,
    basicPassword: process.env.SIMPLEONE_BASIC_PASSWORD,
    timeout: process.env.SIMPLEONE_TIMEOUT,
    autoConfirm: process.env.SIMPLEONE_AUTO_CONFIRM
  });

  if (!result.success) {
    throw new Error(`Ошибка конфигурации: ${result.error.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}

export const config = loadConfig();

export const version = pkg.version;

export function getSanitizedConfig(): Record<string, string> {
  return {
    simpleOneUrl: config.simpleOneUrl,
    apiKey: config.apiKey ? '***' : 'не задан',
    basicUser: config.basicUser ? '***' : 'не задан',
    basicPassword: config.basicPassword ? '***' : 'не задан',
    timeout: `${config.timeout}ms`,
    autoConfirm: config.autoConfirm.toString()
  };
}
