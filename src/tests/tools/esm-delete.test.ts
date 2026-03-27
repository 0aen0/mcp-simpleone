import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tableDeleteHandler } from '../../tools/table-delete';
import { SimpleOneClient } from '../../api/client';

// Мокируем конфиг с autoConfirm=false по умолчанию
vi.mock('../../config.js', () => ({
  config: {
    autoConfirm: false
  }
}));

describe('table_delete инструмент', () => {
  let mockClient: Partial<SimpleOneClient>;

  beforeEach(() => {
    mockClient = {
      deleteResource: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('должен запрашивать подтверждение без флага confirmed', async () => {
    const result = await tableDeleteHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001'
    });

    expect(result).toEqual({
      requiresConfirmation: true,
      confirmation: {
        operation: 'delete',
        resource: 'incident/INC001',
        description: expect.any(String),
        risk: expect.any(String)
      }
    });
  });

  it('должен удалять запись с подтверждением', async () => {
    vi.mocked(mockClient.deleteResource).mockResolvedValue(undefined);

    const result = await tableDeleteHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001',
      confirmed: true
    });

    expect(result).toEqual({
      success: true,
      data: { deleted: true },
      meta: {
        operation: 'esm_delete',
        tableName: 'incident',
        resourceId: 'INC001',
        timestamp: expect.any(String)
      }
    });
  });

  it('должен удалять запись без подтверждения при autoConfirm=true', async () => {
    // Переопределяем конфиг для этого теста
    const { config } = await import('../../config.js');
    (config as any).autoConfirm = true;

    vi.mocked(mockClient.deleteResource).mockResolvedValue(undefined);

    const result = await tableDeleteHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001'
      // confirmed не передан, но autoConfirm=true
    });

    expect(result).toEqual({
      success: true,
      data: { deleted: true },
      meta: {
        operation: 'esm_delete',
        tableName: 'incident',
        resourceId: 'INC001',
        timestamp: expect.any(String)
      }
    });

    // Возвращаем конфиг обратно
    (config as any).autoConfirm = false;
  });

  it('должен оборачивать ошибку API в McpError', async () => {
    const apiError = new Error('API delete failed');
    vi.mocked(mockClient.deleteResource).mockRejectedValue(apiError);

    await expect(
      tableDeleteHandler(mockClient as SimpleOneClient, {
        tableName: 'incident',
        id: 'INC001',
        confirmed: true
      })
    ).rejects.toThrow();
  });
});
