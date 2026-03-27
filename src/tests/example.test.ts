import { describe, it, expect } from 'vitest';

describe('Пример теста', () => {
  it('должен работать', () => {
    expect(1 + 1).toBe(2);
  });

  it('должен работать с объектами', () => {
    const obj = { a: 1, b: 2 };
    expect(obj.a).toBe(1);
  });
});
