/**
 * Базовые типы ресурсов SimpleOne (ESM)
 */

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Инцидент
 */
export interface Incident extends BaseEntity {
  number: string;
  short_description: string;
  description?: string;
  state: string;
  priority?: string;
  assigned_to?: string;
  caller_id?: string;
}

/**
 * Запрос на обслуживание
 */
export interface ServiceRequest extends BaseEntity {
  number: string;
  short_description: string;
  description?: string;
  state: string;
  requested_for?: string;
}

/**
 * Пользователь
 */
export interface User extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
}

/**
 * Типы ресурсов для CRUD операций
 */
export type ResourceType = string;

/**
 * Параметры отображения (display_value)
 */
export type DisplayValue = 'true' | 'false' | '1' | '0';

/**
 * Общие параметры для всех операций
 */
export interface CommonParams {
  /** Возвращать отображаемые значения вместо значений из БД */
  display_value?: DisplayValue;
  /** Исключить ссылки для ссылочных полей */
  exclude_reference_link?: boolean;
  /** Список возвращаемых полей (через запятую) */
  fields?: string;
  /** Представление формы для фильтрации полей */
  view?: string;
}

/**
 * Параметры для CRUD операций
 */
export interface CreateParams<T = Record<string, unknown>> extends CommonParams {
  tableName: string;
  data: T;
}

export interface ReadParams extends CommonParams {
  tableName: string;
  id?: string;
  /** Закодированная строка фильтрации (например, "active=1^priority=2") */
  query?: string;
  /** Максимальное количество результатов (по умолчанию 20) */
  limit?: number;
  /** Номер страницы для пагинации (по умолчанию 1) */
  page?: number;
  /** Отключить подсчёт общего количества записей (для оптимизации) */
  no_count?: boolean;
}

export interface UpdateParams<T = Record<string, unknown>> extends CommonParams {
  tableName: string;
  id: string;
  data: Partial<T>;
}

export interface DeleteParams {
  tableName: string;
  id: string;
}
