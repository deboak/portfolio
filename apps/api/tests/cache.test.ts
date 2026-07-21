import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  scan: vi.fn(),
  del: vi.fn(),
}));
vi.mock('../src/lib/redis.js', () => ({ redis: redisMock }));
import { cache } from '../src/lib/cache.js';

describe('cache utility', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deserializes cached values', async () => {
    redisMock.get.mockResolvedValue(JSON.stringify({ id: 'project-1' }));
    await expect(cache.get('content:project:test')).resolves.toEqual({
      id: 'project-1',
    });
  });

  it('stores values with a TTL', async () => {
    redisMock.set.mockResolvedValue('OK');
    await cache.set('content:projects', [{ id: '1' }], 30);
    expect(redisMock.set).toHaveBeenCalledWith('content:projects', '[{"id":"1"}]', 'EX', 30);
  });

  it('scans and deletes matching keys without using blocking KEYS', async () => {
    redisMock.scan.mockResolvedValue(['0', ['content:project:one', 'content:project:two']]);
    redisMock.del.mockResolvedValue(2);
    await cache.deleteByPrefix('content:project:');
    expect(redisMock.del).toHaveBeenCalledWith('content:project:one', 'content:project:two');
  });
});
