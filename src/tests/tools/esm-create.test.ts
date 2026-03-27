import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tableCreateHandler } from '../../tools/table-create';
import { SimpleOneClient } from '../../api/client';

// Мокируем конфиг с autoConfirm=false по умолчанию
vi.mock('../../config.js', () => ({
  config: {
    autoConfirm: false
  }
}));

describe('table_create инструмент', () => {
  let mockClient: Partial<SimpleOneClient>;

  beforeEach(() => {
    mockClient = {
      createResource: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('должен запрашивать подтверждение без флага confirmed', async () => {
    const result = await tableCreateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      data: { short_description: 'Тест' }
    });

    expect(result).toEqual({
      requiresConfirmation: true,
      confirmation: {
        operation: 'create',
        resource: 'incident',
        description: expect.any(String),
        risk: expect.any(String)
      }
    });
  });

  it('должен создавать запись с подтверждением', async () => {
    const mockData = { short_description: 'Тестовый инцидент' };
    const mockResult = { id: 'INC001', ...mockData };

    vi.mocked(mockClient.createResource).mockResolvedValue(mockResult);

    const result = await tableCreateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      data: mockData,
      confirmed: true
    });

    expect(result).toEqual({
      success: true,
      data: mockResult,
      meta: {
        operation: 'esm_create',
        tableName: 'incident',
        timestamp: expect.any(String)
      }
    });
  });

  it('должен создавать запись без подтверждения при autoConfirm=true', async () => {
    // Переопределяем конфиг для этого теста
    const { config } = await import('../../config.js');
    (config as any).autoConfirm = true;

    const mockData = { short_description: 'Тест с autoConfirm' };
    const mockResult = { id: 'INC002', ...mockData };

    vi.mocked(mockClient.createResource).mockResolvedValue(mockResult);

    const result = await tableCreateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      data: mockData
      // confirmed не передан, но autoConfirm=true
    });

    expect(result).toEqual({
      success: true,
      data: mockResult,
      meta: {
        operation: 'esm_create',
        tableName: 'incident',
        timestamp: expect.any(String)
      }
    });

    // Возвращаем конфиг обратно
    (config as any).autoConfirm = false;
  });

  it('должен оборачивать ошибку API в McpError', async () => {
    const apiError = new Error('API creation failed');
    vi.mocked(mockClient.createResource).mockRejectedValue(apiError);

    await expect(
      tableCreateHandler(mockClient as SimpleOneClient, {
        tableName: 'incident',
        data: {},
        confirmed: true
      })
    ).rejects.toThrow();
  });
});
