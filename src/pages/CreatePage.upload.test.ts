import { describe, expect, it } from 'vitest';
import { getGuidedUploadPrerequisiteError } from './CreatePage';

describe('getGuidedUploadPrerequisiteError', () => {
  it('names all missing upload prerequisites', () => {
    expect(
      getGuidedUploadPrerequisiteError({
        sessionId: null,
        workspaceId: null,
        templateMediaConfig: null,
      }),
    ).toBe('Upload session is not ready: missing sessionId, workspaceId, templateMediaConfig.');
  });

  it('returns undefined when upload prerequisites are ready', () => {
    expect(
      getGuidedUploadPrerequisiteError({
        sessionId: 'session-1',
        workspaceId: 'workspace-1',
        templateMediaConfig: { templateSlug: 'menu', mediaSlots: [], maxAssets: 1 },
      }),
    ).toBeUndefined();
  });
});
