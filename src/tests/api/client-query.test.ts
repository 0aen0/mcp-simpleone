import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleOneClient } from '../../api/client';
import axios from 'axios';

vi.mock('axios');

describe('SimpleOneClient — операторы query', () => {
  const mockConfig = {
    baseUrl: 'https://test.simpleone.ru',
    apiKey: 'test-key',
    timeout: 30000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен выполнять запрос с оператором != (не равно)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', state: 'new' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'state!=closed'
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=state!=closed'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором > (больше)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', priority: 2 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'priority>2'
    });

    // URL кодируется axios: > становится %3E
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=priority%3E2'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором >= (больше или равно)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', priority: 2 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'priority>=2'
    });

    // URL кодируется axios: >= становится %3E=
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=priority%3E=2'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором < (меньше)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', priority: 1 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'priority<3'
    });

    // URL кодируется axios: < становится %3C
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=priority%3C3'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором <= (меньше или равно)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', priority: 2 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'priority<=3'
    });

    // URL кодируется axios: <= становится %3C=
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=priority%3C=3'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором IN (список значений)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', priority: 1 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'priorityIN1,2,3'
    });

    // URL кодируется axios: , становится %2C
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=priorityIN1%2C2%2C3'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором ISNOTEMPTY (не пусто)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', assigned_user: '123' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'assigned_userISNOTEMPTY'
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=assigned_userISNOTEMPTY'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором CHANGESTO (изменилось на)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', state: 'resolved' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'stateCHANGESTOresolved'
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=stateCHANGESTOresolved'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с оператором CHANGES (любое изменение)', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', state: 'new' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'stateCHANGES'
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=stateCHANGES'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять сложный запрос с несколькими операторами', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', state: 'new', priority: 1 }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'active=1^priorityIN1,2^assigned_userISNOTEMPTY'
    });

    // URL кодируется axios: , становится %2C
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=active=1^priorityIN1%2C2^assigned_userISNOTEMPTY'),
      { baseURL: undefined }
    );
  });
});

describe('SimpleOneClient — dot-walking', () => {
  const mockConfig = {
    baseUrl: 'https://test.simpleone.ru',
    apiKey: 'test-key',
    timeout: 30000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен выполнять запрос с dot-walking в fields', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ 
        data: [{ 
          id: 'INC001', 
          number: 'INC001',
          assigned_user: { value: '123', name: 'Иванов Иван' }
        }] 
      }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      fields: 'number,assigned_user.name,assigned_user.email'
    });

    // URL кодируется axios: , становится %2C
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_fields=number%2Cassigned_user.name%2Cassigned_user.email'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с dot-walking в query', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', number: 'INC001' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'assigned_user.department=IT'
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=assigned_user.department=IT'),
      { baseURL: undefined }
    );
  });

  it('должен выполнять запрос с комбинацией dot-walking в fields и query', async () => {
    const mockAxiosInstance = {
      get: vi.fn().mockResolvedValue({ data: [{ id: 'INC001', number: 'INC001' }] }),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.readResource('incident', undefined, {
      query: 'assigned_user.department=IT^active=1',
      fields: 'number,assigned_user.name,assigned_user.department.name'
    });

    // URL кодируется axios: , становится %2C
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_query=assigned_user.department=IT^active=1'),
      { baseURL: undefined }
    );
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_fields=number%2Cassigned_user.name%2Cassigned_user.department.name'),
      { baseURL: undefined }
    );
  });
});

describe('SimpleOneClient — putResource (полное обновление)', () => {
  const mockConfig = {
    baseUrl: 'https://test.simpleone.ru',
    apiKey: 'test-key',
    timeout: 30000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен выполнять PUT запрос на полное обновление', async () => {
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn().mockResolvedValue({ data: { id: 'INC001', state: 'resolved' } }),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    const result = await client.putResource('incident', 'INC001', {
      state: 'resolved',
      description: 'Полное обновление'
    });

    expect(result).toEqual({ id: 'INC001', state: 'resolved' });
    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      expect.stringContaining('incident/INC001'),
      { state: 'resolved', description: 'Полное обновление' }
    );
  });

  it('должен выполнять PUT запрос с параметрами', async () => {
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn().mockResolvedValue({ data: { id: 'INC001', state: 'resolved' } }),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    const client = new SimpleOneClient(mockConfig);
    await client.putResource('incident', 'INC001', {
      state: 'resolved'
    }, {
      display_value: 'true',
      fields: 'number,state'
    });

    // URL кодируется axios: , становится %2C
    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      expect.stringContaining('sysparm_display_value=true&sysparm_fields=number%2Cstate'),
      expect.anything()
    );
  });
});
