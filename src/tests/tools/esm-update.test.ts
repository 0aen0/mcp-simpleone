import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tableUpdateHandler } from '../../tools/table-update';
import { SimpleOneClient } from '../../api/client';

// Мокируем конфиг с autoConfirm=false по умолчанию
vi.mock('../../config.js', () => ({
  config: {
    autoConfirm: false
  }
}));

describe('table_update инструмент', () => {
  let mockClient: Partial<SimpleOneClient>;

  beforeEach(() => {
    mockClient = {
      updateResource: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('должен запрашивать подтверждение без флага confirmed', async () => {
    const result = await tableUpdateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001',
      data: { state: 'in_progress' }
    });

    expect(result).toEqual({
      requiresConfirmation: true,
      confirmation: {
        operation: 'update',
        resource: 'incident/INC001',
        description: expect.any(String),
        risk: expect.any(String)
      }
    });
  });

  it('должен обновлять запись с подтверждением', async () => {
    const mockData = { state: 'in_progress' };
    const mockResult = { id: 'INC001', ...mockData };

    vi.mocked(mockClient.updateResource).mockResolvedValue(mockResult);

    const result = await tableUpdateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001',
      data: mockData,
      confirmed: true
    });

    expect(result).toEqual({
      success: true,
      data: mockResult,
      meta: {
        operation: 'esm_update',
        tableName: 'incident',
        resourceId: 'INC001',
        timestamp: expect.any(String)
      }
    });
  });

  it('должен обновлять запись без подтверждения при autoConfirm=true', async () => {
    // Переопределяем конфиг для этого теста
    const { config } = await import('../../config.js');
    (config as any).autoConfirm = true;

    const mockData = { state: 'resolved' };
    const mockResult = { id: 'INC001', ...mockData };

    vi.mocked(mockClient.updateResource).mockResolvedValue(mockResult);

    const result = await tableUpdateHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001',
      data: mockData
      // confirmed не передан, но autoConfirm=true
    });

    expect(result).toEqual({
      success: true,
      data: mockResult,
      meta: {
        operation: 'esm_update',
        tableName: 'incident',
        resourceId: 'INC001',
        timestamp: expect.any(String)
      }
    });

    // Возвращаем конфиг обратно
    (config as any).autoConfirm = false;
  });

  it('должен оборачивать ошибку API в McpError', async () => {
    const apiError = new Error('API update failed');
    vi.mocked(mockClient.updateResource).mockRejectedValue(apiError);

    await expect(
      tableUpdateHandler(mockClient as SimpleOneClient, {
        tableName: 'incident',
        id: 'INC001',
        data: {},
        confirmed: true
      })
    ).rejects.toThrow();
  });
});
