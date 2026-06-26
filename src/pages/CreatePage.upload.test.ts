import { describe, expect, it } from 'vitest';
import {
  createGuidedSlotsFromConfig,
  getGuidedUploadPrerequisiteError,
  getSmmAgentFailureMessage,
  shouldApproveSmmAgentPreviews,
  shouldRequestSmmAgentOutputs,
  shouldResetSmmAgentJobForNewUpload,
} from './CreatePage';

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

describe('SMM job state helpers', () => {
  it('only allows preview approval while the job is awaiting user approval and not already starting video', () => {
    expect(shouldApproveSmmAgentPreviews({ status: 'waiting_provider', currentStep: 'awaiting_user_approval' }, false)).toBe(true);
    expect(shouldApproveSmmAgentPreviews({ status: 'waiting_provider', currentStep: 'awaiting_user_approval' }, true)).toBe(false);
    expect(shouldApproveSmmAgentPreviews({ status: 'running', currentStep: 'video_generating' }, false)).toBe(false);
    expect(shouldApproveSmmAgentPreviews({ status: 'failed', currentStep: 'video_generating' }, false)).toBe(false);
  });

  it('does not request final video outputs before a successful terminal state', () => {
    expect(shouldRequestSmmAgentOutputs({ status: 'running', currentStep: 'video_generating' }, 'video')).toBe(false);
    expect(shouldRequestSmmAgentOutputs({ status: 'failed', currentStep: 'video_generating' }, 'video')).toBe(false);
    expect(shouldRequestSmmAgentOutputs({ status: 'completed', currentStep: 'video_ready' }, 'video')).toBe(true);
  });

  it('allows preview outputs only at the preview-ready approval gate', () => {
    expect(shouldRequestSmmAgentOutputs({ status: 'running', currentStep: 'image_synthesis' }, 'preview')).toBe(false);
    expect(shouldRequestSmmAgentOutputs({ status: 'waiting_provider', currentStep: 'awaiting_user_approval' }, 'preview')).toBe(true);
  });

  it('uses backend safe failure details for user-visible errors', () => {
    expect(
      getSmmAgentFailureMessage({
        status: 'failed',
        safeError: { message: 'Final video failed. Please retry.' },
      }),
    ).toBe('Final video failed. Please retry.');
    expect(
      getSmmAgentFailureMessage({
        status: 'failed',
        failureReason: 'Video provider is temporarily unavailable.',
      }),
    ).toBe('Video provider is temporarily unavailable.');
  });

  it('resets stale job state before a new upload after terminal job states', () => {
    expect(shouldResetSmmAgentJobForNewUpload({ status: 'failed' })).toBe(true);
    expect(shouldResetSmmAgentJobForNewUpload({ status: 'completed' })).toBe(true);
    expect(shouldResetSmmAgentJobForNewUpload({ status: 'waiting_provider', currentStep: 'awaiting_user_approval' })).toBe(false);
  });

  it('rebuilds reset upload slots with the first required slot active and no stale completions', () => {
    const slots = createGuidedSlotsFromConfig(
      {
        templateSlug: 'menu',
        displayName: 'Menu',
        maxAssets: 2,
        mediaSlots: [
          {
            slotId: 'main',
            label: 'Main photo',
            role: 'dish_main',
            description: 'Main dish',
            required: true,
            min: 1,
            max: 1,
            cameraGuidance: [],
            acceptedObjects: [],
            avoid: [],
          },
          {
            slotId: 'closeup',
            label: 'Close-up',
            role: 'detail',
            description: 'Detail',
            required: false,
            min: 0,
            max: 1,
            cameraGuidance: [],
            acceptedObjects: [],
            avoid: [],
          },
        ],
      },
      [],
    );

    expect(slots.map(slot => [slot.id, slot.status])).toEqual([
      ['main', 'active'],
      ['closeup', 'locked'],
    ]);
  });
});
