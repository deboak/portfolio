import request from 'supertest';
import { describe,expect,it } from 'vitest';
import { createApp } from '../src/app.js';

describe('API hardening',()=>{
  it('sets security headers and does not reveal Express',async()=>{const response=await request(createApp()).get('/api/v1/health');expect(response.headers['x-content-type-options']).toBe('nosniff');expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');expect(response.headers['x-powered-by']).toBeUndefined()});
  it('does not grant CORS access to an unknown origin',async()=>{const response=await request(createApp()).get('/api/v1/health').set('origin','https://attacker.example');expect(response.headers['access-control-allow-origin']).toBeUndefined()});
  it('rejects invalid pagination before accessing the database',async()=>{const response=await request(createApp()).get('/api/v1/projects?limit=500');expect(response.status).toBe(400);expect(response.body.error.code).toBe('VALIDATION_ERROR')});
});
