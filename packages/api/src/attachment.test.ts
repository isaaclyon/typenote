/**
 * Attachment API contract tests.
 *
 * TDD Phase 1: RED - Write failing tests first.
 * These tests define the expected behavior for attachment schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  AttachmentSchema,
  UploadAttachmentInputSchema,
  UploadAttachmentResultSchema,
  AttachmentContentSchema,
  AttachmentErrorCodeSchema,
  Sha256Schema,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type Attachment,
  type UploadAttachmentInput,
  type UploadAttachmentResult,
  type AttachmentContent,
} from './attachment.js';

// ============================================================================
// AttachmentSchema Tests
// ============================================================================

describe('AttachmentSchema', () => {
  const validAttachment = {
    id: '01HZX12345678901234567ABCD',
    sha256: 'a'.repeat(64),
    filename: 'photo.png',
    mimeType: 'image/png',
    sizeBytes: 1024,
    lastReferencedAt: new Date(),
    orphanedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('validates a complete valid attachment', () => {
    const result = AttachmentSchema.safeParse(validAttachment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(validAttachment.id);
      expect(result.data.sha256).toBe(validAttachment.sha256);
      expect(result.data.filename).toBe(validAttachment.filename);
    }
  });

  it('requires id to be 26 characters (ULID)', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      id: 'too-short',
    });
    expect(result.success).toBe(false);
  });

  it('requires sha256 to be exactly 64 characters', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      sha256: 'too-short',
    });
    expect(result.success).toBe(false);
  });

  it('requires sha256 to be lowercase hex', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      sha256: 'G'.repeat(64), // Invalid hex character
    });
    expect(result.success).toBe(false);
  });

  it('requires filename to be non-empty', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      filename: '',
    });
    expect(result.success).toBe(false);
  });

  it('limits filename to 255 characters', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      filename: 'a'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('requires mimeType to be non-empty', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      mimeType: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires sizeBytes to be a positive integer', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      sizeBytes: -1,
    });
    expect(result.success).toBe(false);
  });

  it('allows orphanedAt to be null (still referenced)', () => {
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      orphanedAt: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orphanedAt).toBeNull();
    }
  });

  it('allows orphanedAt to be a date (orphaned)', () => {
    const orphanedDate = new Date();
    const result = AttachmentSchema.safeParse({
      ...validAttachment,
      orphanedAt: orphanedDate,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orphanedAt).toEqual(orphanedDate);
    }
  });
});

// ============================================================================
// UploadAttachmentInputSchema Tests
// ============================================================================

describe('UploadAttachmentInputSchema', () => {
  const validInput = {
    filename: 'photo.png',
    mimeType: 'image/png',
    sizeBytes: 1024,
  };

  it('validates valid upload input', () => {
    const result = UploadAttachmentInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  // MIME type validation
  describe('mimeType validation', () => {
    it('accepts image/png', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'image/png',
      });
      expect(result.success).toBe(true);
    });

    it('accepts image/jpeg', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'image/jpeg',
      });
      expect(result.success).toBe(true);
    });

    it('accepts image/gif', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'image/gif',
      });
      expect(result.success).toBe(true);
    });

    it('accepts image/webp', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'image/webp',
      });
      expect(result.success).toBe(true);
    });

    it('accepts application/pdf', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'application/pdf',
      });
      expect(result.success).toBe(true);
    });

    it('accepts text/plain', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'text/plain',
      });
      expect(result.success).toBe(true);
    });

    it('rejects unsupported MIME type (application/exe)', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'application/exe',
      });
      expect(result.success).toBe(false);
    });

    it('rejects application/javascript', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'application/javascript',
      });
      expect(result.success).toBe(false);
    });

    it('rejects application/x-msdownload', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        mimeType: 'application/x-msdownload',
      });
      expect(result.success).toBe(false);
    });
  });

  // Size validation
  describe('sizeBytes validation', () => {
    it('accepts file at exactly 10 MB', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        sizeBytes: 10 * 1024 * 1024, // 10 MB
      });
      expect(result.success).toBe(true);
    });

    it('rejects file over 10 MB', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        sizeBytes: 10 * 1024 * 1024 + 1, // 10 MB + 1 byte
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative file size', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        sizeBytes: -1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects zero file size', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        sizeBytes: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  // Filename validation
  describe('filename validation', () => {
    it('requires filename to be non-empty', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        filename: '',
      });
      expect(result.success).toBe(false);
    });

    it('limits filename to 255 characters', () => {
      const result = UploadAttachmentInputSchema.safeParse({
        ...validInput,
        filename: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// UploadAttachmentResultSchema Tests
// ============================================================================

describe('UploadAttachmentResultSchema', () => {
  it('validates successful upload result', () => {
    const result = UploadAttachmentResultSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      wasDeduped: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wasDeduped).toBe(false);
    }
  });

  it('validates deduped upload result', () => {
    const result = UploadAttachmentResultSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      wasDeduped: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wasDeduped).toBe(true);
    }
  });

  it('requires attachmentId to be 26 characters', () => {
    const result = UploadAttachmentResultSchema.safeParse({
      attachmentId: 'short',
      wasDeduped: false,
    });
    expect(result.success).toBe(false);
  });

  it('requires wasDeduped boolean', () => {
    const result = UploadAttachmentResultSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      // missing wasDeduped
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// AttachmentContentSchema Tests (Block Content)
// ============================================================================

describe('AttachmentContentSchema', () => {
  it('validates minimal attachment content', () => {
    const result = AttachmentContentSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
    });
    expect(result.success).toBe(true);
  });

  it('validates attachment content with alt text', () => {
    const result = AttachmentContentSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      alt: 'Screenshot of the dashboard',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alt).toBe('Screenshot of the dashboard');
    }
  });

  it('validates attachment content with caption', () => {
    const result = AttachmentContentSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      caption: 'Figure 1: Dashboard overview',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caption).toBe('Figure 1: Dashboard overview');
    }
  });

  it('validates attachment content with both alt and caption', () => {
    const result = AttachmentContentSchema.safeParse({
      attachmentId: '01HZX12345678901234567ABCD',
      alt: 'Screenshot',
      caption: 'Figure 1',
    });
    expect(result.success).toBe(true);
  });

  it('requires attachmentId to be 26 characters', () => {
    const result = AttachmentContentSchema.safeParse({
      attachmentId: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('requires attachmentId field', () => {
    const result = AttachmentContentSchema.safeParse({
      alt: 'Some alt text',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('SUPPORTED_MIME_TYPES', () => {
  it('includes image/png', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('image/png');
  });

  it('includes image/jpeg', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('image/jpeg');
  });

  it('includes image/gif', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('image/gif');
  });

  it('includes image/webp', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('image/webp');
  });

  it('includes application/pdf', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('application/pdf');
  });

  it('includes text/plain', () => {
    expect(SUPPORTED_MIME_TYPES).toContain('text/plain');
  });

  it('does not include application/javascript', () => {
    expect(SUPPORTED_MIME_TYPES).not.toContain('application/javascript');
  });

  it('is an array of strings', () => {
    expect(Array.isArray(SUPPORTED_MIME_TYPES)).toBe(true);
    expect(SUPPORTED_MIME_TYPES.length).toBeGreaterThan(0);
  });
});

describe('MAX_FILE_SIZE_BYTES', () => {
  it('equals 10 MB', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});

// ============================================================================
// Type Inference Tests (Compile-time checks)
// ============================================================================

describe('Type inference', () => {
  it('Attachment type has correct structure', () => {
    // This test verifies the type inference works correctly
    // If types are wrong, TypeScript compilation will fail
    const attachment: Attachment = {
      id: '01HZX12345678901234567ABCD',
      sha256: 'a'.repeat(64),
      filename: 'test.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      lastReferencedAt: new Date(),
      orphanedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(attachment.id).toBeDefined();
  });

  it('UploadAttachmentInput type has correct structure', () => {
    const input: UploadAttachmentInput = {
      filename: 'test.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
    };
    expect(input.filename).toBeDefined();
  });

  it('UploadAttachmentResult type has correct structure', () => {
    const result: UploadAttachmentResult = {
      attachmentId: '01HZX12345678901234567ABCD',
      wasDeduped: false,
    };
    expect(result.attachmentId).toBeDefined();
  });

  it('AttachmentContent type has correct structure', () => {
    const content: AttachmentContent = {
      attachmentId: '01HZX12345678901234567ABCD',
      alt: 'Alt text',
      caption: 'Caption',
    };
    expect(content.attachmentId).toBeDefined();
  });
});

// ============================================================================
// Sha256Schema Regex Anchor Tests (Mutation Testing)
// ============================================================================

describe('Sha256Schema regex validation', () => {
  const valid64Hex = 'a'.repeat(64);

  it('rejects sha256 with prefix junk before valid 64 chars', () => {
    const result = Sha256Schema.safeParse('xyz' + valid64Hex);
    expect(result.success).toBe(false);
  });

  it('rejects sha256 with suffix junk after valid 64 chars', () => {
    const result = Sha256Schema.safeParse(valid64Hex + 'xyz');
    expect(result.success).toBe(false);
  });

  it('provides descriptive error message for invalid sha256', () => {
    // Use 64 chars with uppercase to trigger regex validation (not length check)
    const result = Sha256Schema.safeParse('A'.repeat(64));
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message;
      expect(errorMessage).toContain('SHA256');
    }
  });
});

// ============================================================================
// AttachmentErrorCodeSchema Tests (Mutation Testing)
// ============================================================================

describe('AttachmentErrorCodeSchema', () => {
  it('contains expected error codes', () => {
    expect(AttachmentErrorCodeSchema.safeParse('ATTACHMENT_NOT_FOUND').success).toBe(true);
    expect(AttachmentErrorCodeSchema.safeParse('FILE_TOO_LARGE').success).toBe(true);
    expect(AttachmentErrorCodeSchema.safeParse('UNSUPPORTED_FILE_TYPE').success).toBe(true);
  });

  it('rejects invalid error codes', () => {
    expect(AttachmentErrorCodeSchema.safeParse('INVALID_CODE').success).toBe(false);
  });
});
