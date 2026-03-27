import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleOneClient, ApiError } from '../../api/client';
import axios from 'axios';

vi.mock('axios');

describe('SimpleOneClient', () => {
  const mockConfig = {
    baseUrl: 'https://test.simpleone.ru',
    apiKey: 'test-key',
    timeout: 30000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен создавать экземпляр с правильными заголовками', () => {
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://test.simpleone.ru/rest/v1/table/',
      timeout: mockConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': mockConfig.apiKey
      },
      httpsAgent: expect.anything()
    });
  });

  it('должен выполнять GET запрос', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: { id: 'INC001', number: 'INC001' } }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    const result = await client.get('incident/INC001');

    expect(result).toEqual({ id: 'INC001', number: 'INC001' });
    // URL содержит двойной слэш из-за реализации buildApiUrl и buildResourceUrl
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      'https://test.simpleone.ru/rest/v1/table/incident/INC001',
      { baseURL: undefined }
    );
  });

  it('должен оборачивать HTTP ошибки в ApiError', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockRejectedValue({
        response: { status: 404, data: { error: 'Not found' } },
        message: 'Not Found'
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);

    try {
      await client.get('/incident/NOTFOUND');
      fail('Expected ApiError to be thrown');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Not Found');
    }
  });
});
