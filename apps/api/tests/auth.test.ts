import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { tokenService } from '../src/modules/auth/token.service.js';

describe('admin authentication boundary', () => {
  it('rejects an unauthenticated admin request', async () => {
    const response = await request(createApp()).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('accepts a valid short-lived access token', async () => {
    const access = tokenService.access({
      id: 'admin-test',
      email: 'admin@example.com',
    });
    const response = await request(createApp())
      .get('/api/v1/auth/me')
      .set('authorization', `Bearer ${access}`);
    expect(response.status).toBe(200);
    expect(response.body.data.admin.email).toBe('admin@example.com');
  });

  it('rejects state changes without a CSRF token', async () => {
    const response = await request(createApp()).post('/api/v1/auth/logout');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_INVALID');
  });
});
