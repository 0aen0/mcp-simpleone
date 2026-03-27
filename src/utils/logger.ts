import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getSanitizedConfig } from '../config.js';

/**
 * Уровни логирования (от самого подробного к самому критичному)
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * Числовые значения уровней логирования для сравнения
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

/**
 * Типы вывода логов
 */
export type LogOutput = 'stdout' | 'file' | 'both';

/**
 * Парсит строку уровня логирования в тип LogLevel
 */
export function parseLogLevel(level: string): LogLevel {
  const normalized = level.toLowerCase().trim();
  if (normalized in LOG_LEVELS) {
    return normalized as LogLevel;
  }
  // Значения по умолчанию для некорректных значений
  console.warn(`[Logger] Некорректный уровень логирования "${level}". Используется "info"`);
  return 'info';
}

/**
 * Получает уровень логирования из переменной окружения LOG_LEVEL
 * По умолчанию: 'info'
 */
export function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL;
  if (!envLevel) {
    return 'info';
  }
  return parseLogLevel(envLevel);
}

/**
 * Получает тип вывода логов из переменной окружения LOG_OUTPUT
 * По умолчанию: 'stdout'
 * Возможные значения: stdout, file, both
 */
export function getLogOutputFromEnv(): LogOutput {
  const envOutput = process.env.LOG_OUTPUT;
  if (!envOutput) {
    return 'stdout';
  }
  const normalized = envOutput.toLowerCase().trim();
  if (normalized === 'file' || normalized === 'both' || normalized === 'stdout') {
    return normalized as LogOutput;
  }
  console.warn(`[Logger] Некорректный тип вывода логов "${envOutput}". Используется "stdout"`);
  return 'stdout';
}

/**
 * Получает путь к файлу логов из переменной окружения LOG_FILE
 * По умолчанию: ./logs/mcp-simpleone.log
 */
export function getLogFileFromEnv(): string {
  return process.env.LOG_FILE || './logs/mcp-simpleone.log';
}

/**
 * Маскирует чувствительные данные в строке
 */
function maskSensitiveData(data: string): string {
  // Маскируем API-ключи (паттерн: длинные строки)
  let masked = data.replace(/(api[_-]?key|apikey|token|secret)["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi, '$1=***');
  
  // Маскируем Basic Auth пароли
  masked = masked.replace(/(password|passwd|pwd)["']?\s*[:=]\s*["']?([^"'\s]+)["']?/gi, '$1=***');
  
  return masked;
}

/**
 * Рекурсивно маскирует чувствительные данные в объекте
 */
function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 5) return '[MAX_DEPTH]';

  if (typeof obj === 'string') {
    return maskSensitiveData(obj);
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (['password', 'apiKey', 'api_key', 'token', 'secret', 'authorization', 'apikey'].includes(lowerKey)) {
      result[key] = '***';
    } else {
      result[key] = sanitizeObject(value, depth + 1);
    }
  }

  return result;
}

/**
 * Логгер с маскировкой чувствительных данных
 * Уровень логирования настраивается через переменную окружения LOG_LEVEL
 * Вывод настраивается через переменную окружения LOG_OUTPUT (stdout, file, both)
 * Путь к файлу логов настраивается через переменную окружения LOG_FILE
 * Возможные значения уровня: trace, debug, info, warn, error (по умолчанию: info)
 * Возможные значения вывода: stdout, file, both (по умолчанию: stdout)
 */
export class Logger {
  private minLevel: LogLevel;
  private prefix: string;
  private logOutput: LogOutput;
  private logFile: string;

  constructor(prefix: string = 'MCP', minLevel?: LogLevel, logOutput?: LogOutput, logFile?: string) {
    this.prefix = prefix;
    this.minLevel = minLevel ?? getLogLevelFromEnv();
    this.logOutput = logOutput ?? getLogOutputFromEnv();
    this.logFile = logFile ?? getLogFileFromEnv();
    
    // Создаём директорию для логов если она не существует
    if (this.logOutput === 'file' || this.logOutput === 'both') {
      this.ensureLogDirectory();
    }
  }

  /**
   * Создаёт директорию для файла логов если она не существует
   */
  private ensureLogDirectory(): void {
    const logDir = dirname(resolve(this.logFile));
    if (!existsSync(logDir)) {
      try {
        mkdirSync(logDir, { recursive: true });
      } catch (error) {
        console.error(`[Logger] Не удалось создать директорию для логов: ${logDir}`);
      }
    }
  }

  /**
   * Записывает сообщение в файл логов
   */
  private writeToFile(message: string): void {
    try {
      appendFileSync(this.logFile, message + '\n', { encoding: 'utf8' });
    } catch (error) {
      // Тихо игнорируем ошибки записи в файл чтобы не ломать основную функциональность
      // Но логируем ошибку в stdout если он включён
      if (this.logOutput === 'stdout' || this.logOutput === 'both') {
        console.error(`[Logger] Ошибка записи в файл: ${this.logFile}`);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? JSON.stringify(sanitizeObject(data)) : '';
    return `[${timestamp}] [${this.prefix}] [${level.toUpperCase().padEnd(5, ' ')}] ${message}${sanitizedData ? ' ' + sanitizedData : ''}`;
  }

  /**
   * Записывает сообщение в выбранные выходы (stdout, file, или оба)
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);

    // Запись в stdout
    if (this.logOutput === 'stdout' || this.logOutput === 'both') {
      // Используем соответствующие методы console для каждого уровня
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else if (level === 'debug' || level === 'trace') {
        console.debug(formattedMessage);
      } else {
        console.info(formattedMessage);
      }
    }

    // Запись в файл
    if (this.logOutput === 'file' || this.logOutput === 'both') {
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Трассировка (самый подробный уровень)
   * Используется для детальной отладки внутренних процессов
   */
  trace(message: string, data?: unknown): void {
    this.log('trace', message, data);
  }

  /**
   * Отладочная информация
   * Используется для отладки
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  /**
   * Информационное сообщение
   * Используется для общих событий
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * Предупреждение
   * Используется для потенциальных проблем
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * Ошибка
   * Используется для критических ошибок
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * Изменяет минимальный уровень логирования динамически
   */
  setLevel(level: LogLevel): void {
    const oldLevel = this.minLevel;
    this.minLevel = level;
    this.info('Уровень логирования изменён', { oldLevel, newLevel: level });
  }

  /**
   * Возвращает текущий уровень логирования
   */
  getLevel(): LogLevel {
    return this.minLevel;
  }

  /**
   * Логирует конфигурацию без секретов
   */
  logConfig(): void {
    this.info('Конфигурация загружена', getSanitizedConfig());
  }
}

export const logger = new Logger('SimpleOneMCP');
