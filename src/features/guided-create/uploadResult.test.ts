import { describe, expect, it } from 'vitest';
import { isSuccessfulUploadResult } from './CreateWorkflowPage';

describe('isSuccessfulUploadResult', () => {
  it('requires accepted status, assetId, previewUrl, and assigned slot', () => {
    expect(isSuccessfulUploadResult(undefined, 'slot-1')).toBe(false);
    expect(isSuccessfulUploadResult({ status: 'unassigned', assetId: 'asset-1', previewUrl: 'https://cdn/a.jpg', slotId: 'slot-1' }, 'slot-1')).toBe(false);
    expect(isSuccessfulUploadResult({ status: 'accepted', assetId: 'asset-1', slotId: 'slot-1' }, 'slot-1')).toBe(false);
    expect(isSuccessfulUploadResult({ status: 'accepted', previewUrl: 'https://cdn/a.jpg', slotId: 'slot-1' }, 'slot-1')).toBe(false);
    expect(isSuccessfulUploadResult({ status: 'accepted', assetId: 'asset-1', previewUrl: 'https://cdn/a.jpg', slotId: 'slot-1' }, 'slot-1')).toBe(true);
  });
});
