import request from 'supertest';
import { describe,expect,it } from 'vitest';
import { createApp } from '../src/app.js';

describe('admin notification stream',()=>{
  it('requires an administrator access token',async()=>{
    const response=await request(createApp()).get('/api/v1/admin/notifications/stream');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
