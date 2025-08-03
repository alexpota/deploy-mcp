import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VercelAdapter } from '../src/adapters/index.js';

describe('VercelAdapter', () => {
  let adapter: VercelAdapter;
  
  beforeEach(() => {
    adapter = new VercelAdapter();
    vi.resetAllMocks();
  });
  
  it('should fetch deployment status successfully', async () => {
    const mockDeployment = {
      deployments: [{
        uid: 'dpl_123',
        name: 'test-project',
        state: 'READY',
        url: 'test-project-abc123.vercel.app',
        createdAt: Date.now() - 60000,
        ready: Date.now(),
        buildingAt: Date.now() - 50000,
        creator: {
          uid: 'user_123',
          username: 'testuser'
        },
        meta: {
          githubCommitSha: 'abc123',
          githubCommitMessage: 'feat: add new feature',
          githubCommitAuthorName: 'Test User'
        },
        target: 'production'
      }]
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDeployment
    } as Response);
    
    const status = await adapter.getLatestDeployment('test-project', 'fake-token');
    
    expect(status.status).toBe('success');
    expect(status.url).toBe('https://test-project-abc123.vercel.app');
    expect(status.projectName).toBe('test-project');
    expect(status.platform).toBe('vercel');
    expect(status.environment).toBe('production');
    expect(status.commit).toEqual({
      sha: 'abc123',
      message: 'feat: add new feature',
      author: 'Test User'
    });
    expect(status.duration).toBeGreaterThan(0);
  });
  
  it('should handle building state', async () => {
    const mockDeployment = {
      deployments: [{
        uid: 'dpl_456',
        name: 'test-project',
        state: 'BUILDING',
        url: 'test-project-xyz789.vercel.app',
        createdAt: Date.now(),
        creator: {
          uid: 'user_123',
          username: 'testuser'
        }
      }]
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDeployment
    } as Response);
    
    const status = await adapter.getLatestDeployment('test-project', 'fake-token');
    
    expect(status.status).toBe('building');
  });
  
  it('should handle error state', async () => {
    const mockDeployment = {
      deployments: [{
        uid: 'dpl_789',
        name: 'test-project',
        state: 'ERROR',
        url: 'test-project-error.vercel.app',
        createdAt: Date.now(),
        creator: {
          uid: 'user_123',
          username: 'testuser'
        }
      }]
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDeployment
    } as Response);
    
    const status = await adapter.getLatestDeployment('test-project', 'fake-token');
    
    expect(status.status).toBe('failed');
  });
  
  it('should handle no deployments', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ deployments: [] })
    } as Response);
    
    const status = await adapter.getLatestDeployment('test-project', 'fake-token');
    
    expect(status.status).toBe('unknown');
    expect(status.projectName).toBe('test-project');
    expect(status.platform).toBe('vercel');
  });
  
  it('should throw error for invalid token', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    } as Response);
    
    await expect(adapter.getLatestDeployment('test-project', 'invalid-token'))
      .rejects.toThrow('Invalid Vercel token');
  });
  
  it('should throw error for missing project', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    } as Response);
    
    await expect(adapter.getLatestDeployment('non-existent', 'fake-token'))
      .rejects.toThrow('Project not found');
  });
  
  it('should use environment token when not provided', async () => {
    process.env.VERCEL_TOKEN = 'env-token';
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ deployments: [] })
    } as Response);
    
    await adapter.getLatestDeployment('test-project');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer env-token'
        })
      })
    );
    
    delete process.env.VERCEL_TOKEN;
  });
  
  it('should throw error when no token is available', async () => {
    delete process.env.VERCEL_TOKEN;
    
    await expect(adapter.getLatestDeployment('test-project'))
      .rejects.toThrow('Vercel token required');
  });
  
  it('should authenticate with valid token', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: { uid: 'test-user' } })
    } as Response);
    
    const isValid = await adapter.authenticate('valid-token');
    
    expect(isValid).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.vercel.com/v2/user',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-token'
        })
      })
    );
  });
  
  it('should fail authentication with invalid token', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401
    } as Response);
    
    const isValid = await adapter.authenticate('invalid-token');
    
    expect(isValid).toBe(false);
  });
});