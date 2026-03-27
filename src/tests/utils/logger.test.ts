import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, parseLogLevel, getLogLevelFromEnv } from '../../utils/logger.js';

describe('Logger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseLogLevel', () => {
    it('должен парсить корректные уровни', () => {
      expect(parseLogLevel('trace')).toBe('trace');
      expect(parseLogLevel('debug')).toBe('debug');
      expect(parseLogLevel('info')).toBe('info');
      expect(parseLogLevel('warn')).toBe('warn');
      expect(parseLogLevel('error')).toBe('error');
    });

    it('должен игнорировать регистр', () => {
      expect(parseLogLevel('TRACE')).toBe('trace');
      expect(parseLogLevel('Debug')).toBe('debug');
      expect(parseLogLevel('INFO')).toBe('info');
    });

    it('должен возвращать info для некорректных значений', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(parseLogLevel('invalid')).toBe('info');
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('getLogLevelFromEnv', () => {
    it('должен возвращать info по умолчанию', () => {
      delete process.env.LOG_LEVEL;
      expect(getLogLevelFromEnv()).toBe('info');
    });

    it('должен читать из переменной окружения', () => {
      process.env.LOG_LEVEL = 'debug';
      expect(getLogLevelFromEnv()).toBe('debug');
    });

    it('должен парсить переменную окружения без регистра', () => {
      process.env.LOG_LEVEL = 'TRACE';
      expect(getLogLevelFromEnv()).toBe('trace');
    });
  });

  describe('Logger levels', () => {
    it('должен логировать все уровни при trace', () => {
      const logger = new Logger('Test', 'trace', 'stdout');

      logger.trace('trace msg');
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).toHaveBeenCalledTimes(2); // trace + debug
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('должен логировать только debug+ при debug', () => {
      const logger = new Logger('Test', 'debug', 'stdout');

      logger.trace('trace msg');
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).toHaveBeenCalledTimes(1); // только debug
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('должен логировать только info+ при info', () => {
      const logger = new Logger('Test', 'info', 'stdout');

      logger.trace('trace msg');
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('должен логировать только warn+ при warn', () => {
      const logger = new Logger('Test', 'warn', 'stdout');

      logger.trace('trace msg');
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('должен логировать только error при error', () => {
      const logger = new Logger('Test', 'error', 'stdout');

      logger.trace('trace msg');
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logger.setLevel', () => {
    it('должен динамически менять уровень', () => {
      const logger = new Logger('Test', 'error', 'stdout');

      logger.info('msg1'); // не должно логироваться
      expect(infoSpy).not.toHaveBeenCalled();

      logger.setLevel('info');
      // setLevel сам вызывает logger.info, поэтому игнорируем первый вызов
      infoSpy.mockClear();

      logger.info('msg2'); // должно логироваться
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logger.getLevel', () => {
    it('должен возвращать текущий уровень', () => {
      const logger = new Logger('Test', 'debug', 'stdout');
      expect(logger.getLevel()).toBe('debug');

      logger.setLevel('trace');
      expect(logger.getLevel()).toBe('trace');
    });
  });

  describe('Logger маскировка данных', () => {
    it('должен маскировать пароли', () => {
      const logger = new Logger('Test', 'debug', 'stdout');
      logger.debug('msg', { password: 'secret123', user: 'admin' });

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const call = debugSpy.mock.calls[0];
      const message = call[0] as string;
      expect(message).toContain('password');
      expect(message).not.toContain('secret123');
    });

    it('должен маскировать API ключи', () => {
      const logger = new Logger('Test', 'debug', 'stdout');
      logger.debug('msg', { apiKey: 'very_long_secret_key_12345' });

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const call = debugSpy.mock.calls[0];
      const message = call[0] as string;
      expect(message).not.toContain('very_long_secret_key_12345');
    });
  });

  describe('Logger форматирование', () => {
    it('должен добавлять timestamp', () => {
      const logger = new Logger('Test', 'info', 'stdout');
      logger.info('test');

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const call = infoSpy.mock.calls[0];
      const message = call[0] as string;
      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('должен добавлять префикс', () => {
      const logger = new Logger('MyPrefix', 'info', 'stdout');
      logger.info('test');

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const call = infoSpy.mock.calls[0];
      const message = call[0] as string;
      expect(message).toContain('[MyPrefix]');
    });

    it('должен выравнивать уровни по ширине', () => {
      const logger = new Logger('Test', 'trace', 'stdout');
      logger.trace('test');
      logger.info('test');

      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledTimes(1);
      const traceCall = debugSpy.mock.calls[0];
      const infoCall = infoSpy.mock.calls[0];

      // TRACE и INFO должны иметь одинаковую длину (5 символов)
      expect(traceCall[0]).toContain('[TRACE]');
      expect(infoCall[0]).toContain('[INFO ]');
    });
  });
});
