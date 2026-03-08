import { isValidTransition, VALID_TRANSITIONS } from '@agency/orchestrator';

describe('State Machine — isValidTransition()', () => {
  describe('Valid transitions', () => {
    it('should allow DISCOVERED → RESEARCHED', () => {
      expect(isValidTransition('DISCOVERED', 'RESEARCHED')).toBe(true);
    });

    it('should allow RESEARCHED → AUDITED', () => {
      expect(isValidTransition('RESEARCHED', 'AUDITED')).toBe(true);
    });

    it('should allow AUDITED → QUALIFIED', () => {
      expect(isValidTransition('AUDITED', 'QUALIFIED')).toBe(true);
    });

    it('should allow AUDITED → DISQUALIFIED', () => {
      expect(isValidTransition('AUDITED', 'DISQUALIFIED')).toBe(true);
    });

    it('should allow OUTREACH_SENT → REPLIED', () => {
      expect(isValidTransition('OUTREACH_SENT', 'REPLIED')).toBe(true);
    });

    it('should allow DELIVERED → CLOSED_WON', () => {
      expect(isValidTransition('DELIVERED', 'CLOSED_WON')).toBe(true);
    });

    it('should allow all transitions defined in VALID_TRANSITIONS', () => {
      for (const [from, tos] of Object.entries(VALID_TRANSITIONS)) {
        for (const to of tos) {
          expect(isValidTransition(from, to)).toBe(true);
        }
      }
    });
  });

  describe('Invalid transitions', () => {
    it('should reject DISCOVERED → PAID (skipping stages)', () => {
      expect(isValidTransition('DISCOVERED', 'PAID')).toBe(false);
    });

    it('should reject CLOSED_WON → DISCOVERED (no going backwards from terminal)', () => {
      expect(isValidTransition('CLOSED_WON', 'DISCOVERED')).toBe(false);
    });

    it('should reject an unknown from-state', () => {
      expect(isValidTransition('INVALID_STATE', 'DISCOVERED')).toBe(false);
    });

    it('should reject an unknown to-state', () => {
      expect(isValidTransition('DISCOVERED', 'NONEXISTENT')).toBe(false);
    });

    it('should reject PAID → OUTREACH_SENT (backward skip)', () => {
      expect(isValidTransition('PAID', 'OUTREACH_SENT')).toBe(false);
    });
  });
});
