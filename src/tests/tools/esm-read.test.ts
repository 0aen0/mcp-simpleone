import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tableReadHandler } from '../../tools/table-read';
import { SimpleOneClient } from '../../api/client';

describe('table_read инструмент', () => {
  let mockClient: Partial<SimpleOneClient>;

  beforeEach(() => {
    mockClient = {
      readResource: vi.fn()
    };
  });

  it('должен читать одну запись по ID', async () => {
    const mockData = {
      id: 'INC001',
      number: 'INC001',
      short_description: 'Тестовый инцидент',
      state: 'new'
    };

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    const result = await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001'
    });

    expect(result).toEqual({
      success: true,
      data: [mockData],
      meta: {
        operation: 'esm_read',
        tableName: 'incident',
        resourceId: 'INC001',
        count: 1,
        timestamp: expect.any(String)
      }
    });
  });

  it('должен читать список записей без ID', async () => {
    const mockData = [
      { id: 'INC001', number: 'INC001', short_description: 'Инцидент 1' },
      { id: 'INC002', number: 'INC002', short_description: 'Инцидент 2' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    const result = await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident'
    });

    expect(result).toEqual({
      success: true,
      data: mockData,
      meta: {
        operation: 'esm_read',
        tableName: 'incident',
        count: 2,
        timestamp: expect.any(String)
      }
    });
  });

  it('должен читать с параметром display_value="true"', async () => {
    const mockData = [
      { id: 'INC001', number: 'INC001', state: 'Новый', assigned_user: 'Иванов Иван' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      display_value: 'true'
    });

    expect(vi.mocked(mockClient.readResource)).toHaveBeenCalledWith(
      'incident',
      undefined,
      expect.objectContaining({
        display_value: 'true'
      })
    );
  });

  it('должен читать с параметром exclude_reference_link=true', async () => {
    const mockData = [
      { id: 'INC001', number: 'INC001', assigned_user: '123' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      exclude_reference_link: true
    });

    expect(vi.mocked(mockClient.readResource)).toHaveBeenCalledWith(
      'incident',
      undefined,
      expect.objectContaining({
        exclude_reference_link: true
      })
    );
  });

  it('должен читать с пагинацией (page=2, limit=10)', async () => {
    const mockData = [
      { id: 'INC011', number: 'INC011', short_description: 'Инцидент 11' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      limit: 10,
      page: 2
    });

    expect(vi.mocked(mockClient.readResource)).toHaveBeenCalledWith(
      'incident',
      undefined,
      expect.objectContaining({
        limit: 10,
        page: 2
      })
    );
  });

  it('должен читать с параметром no_count=true', async () => {
    const mockData = [
      { id: 'INC001', number: 'INC001', short_description: 'Инцидент 1' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      no_count: true
    });

    expect(vi.mocked(mockClient.readResource)).toHaveBeenCalledWith(
      'incident',
      undefined,
      expect.objectContaining({
        no_count: true
      })
    );
  });

  it('должен читать с параметром view', async () => {
    const mockData = [
      { id: 'INC001', number: 'INC001', short_description: 'Инцидент 1' }
    ];

    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      view: 'default'
    });

    expect(vi.mocked(mockClient.readResource)).toHaveBeenCalledWith(
      'incident',
      undefined,
      expect.objectContaining({
        view: 'default'
      })
    );
  });

  it('должен оборачивать ошибку API в McpError', async () => {
    const apiError = new Error('API connection failed');
    vi.mocked(mockClient.readResource).mockRejectedValue(apiError);

    await expect(
      tableReadHandler(mockClient as SimpleOneClient, {
        tableName: 'incident',
        id: 'INC001'
      })
    ).rejects.toThrow();
  });
});
