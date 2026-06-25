// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  api,
  evaluateApiBase,
  resolveMediaUrl,
  selectAssetPreviewUrl,
} from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('resolveMediaUrl', () => {
  it('returns undefined for empty/blank input', () => {
    expect(resolveMediaUrl(undefined)).toBeUndefined();
    expect(resolveMediaUrl(null)).toBeUndefined();
    expect(resolveMediaUrl('')).toBeUndefined();
    expect(resolveMediaUrl('   ')).toBeUndefined();
  });

  it('does not double-prefix absolute http/https URLs', () => {
    const abs = 'https://smmaibackend.onrender.com/files/a.jpg';
    expect(resolveMediaUrl(abs)).toBe(abs);
    const http = 'http://example.com/x.png';
    expect(resolveMediaUrl(http)).toBe(http);
  });

  it('returns blob: and data: URLs as-is', () => {
    expect(resolveMediaUrl('blob:https://x/abc')).toBe('blob:https://x/abc');
    expect(resolveMediaUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });
});

describe('selectAssetPreviewUrl', () => {
  it('prefers browserUrl over thumbnailUrl and url', () => {
    expect(
      selectAssetPreviewUrl({
        browserUrl: 'https://a/b.jpg',
        thumbnailUrl: 'https://a/t.jpg',
        url: 'https://a/u.jpg',
      }),
    ).toBe('https://a/b.jpg');
  });

  it('falls back to thumbnailUrl then url', () => {
    expect(
      selectAssetPreviewUrl({ thumbnailUrl: 'https://a/t.jpg', url: 'https://a/u.jpg' }),
    ).toBe('https://a/t.jpg');
    expect(selectAssetPreviewUrl({ url: 'https://a/u.jpg' })).toBe('https://a/u.jpg');
  });

  it('never uses providerUrl for preview', () => {
    expect(selectAssetPreviewUrl({ providerUrl: 'https://provider/secret.jpg' })).toBeUndefined();
    expect(selectAssetPreviewUrl({})).toBeUndefined();
  });
});

describe('evaluateApiBase', () => {
  it('detects a missing (relative) production API base', () => {
    const result = evaluateApiBase('/api', true);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('VITE_API_BASE_URL is missing');
  });

  it('accepts an absolute production API base', () => {
    expect(evaluateApiBase('https://smmaibackend.onrender.com/api', true).ok).toBe(true);
  });

  it('allows a relative base in development', () => {
    expect(evaluateApiBase('/api', false).ok).toBe(true);
  });
});

describe('api.createAsset', () => {
  it('maps browserUrl/thumbnailUrl/providerUrl/storageKey/mimeType and uploadUrl', async () => {
    localStorage.setItem('token', 'test-token');
    const payload = {
      asset: {
        id: 'asset-1',
        status: 'pending_upload',
        key: 'workspaces/w/asset-1.jpg',
        storageKey: 'workspaces/w/asset-1.jpg',
        mimeType: 'image/jpeg',
        browserUrl: 'https://cdn.example.com/asset-1.jpg',
        thumbnailUrl: 'https://cdn.example.com/asset-1-thumb.jpg',
        providerUrl: 'https://r2.internal/asset-1.jpg',
      },
      upload: { uploadUrl: 'https://upload.example.com/put-target' },
    };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'application/json' : null) },
      json: async () => payload,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const file = new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' });
    const created = await api.createAsset({ workspaceId: 'w', file });

    expect(created.id).toBe('asset-1');
    expect(created.status).toBe('pending_upload');
    expect(created.key).toBe('workspaces/w/asset-1.jpg');
    expect(created.storageKey).toBe('workspaces/w/asset-1.jpg');
    expect(created.mimeType).toBe('image/jpeg');
    expect(created.browserUrl).toBe('https://cdn.example.com/asset-1.jpg');
    expect(created.thumbnailUrl).toBe('https://cdn.example.com/asset-1-thumb.jpg');
    expect(created.providerUrl).toBe('https://r2.internal/asset-1.jpg');
    expect(created.uploadUrl).toBe('https://upload.example.com/put-target');
  });
});
