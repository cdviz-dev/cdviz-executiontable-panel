import { getOutcomeColor, OUTCOME_COLORS } from './types';

describe('getOutcomeColor', () => {
  it('should return green for success outcomes', () => {
    expect(getOutcomeColor('success')).toBe(OUTCOME_COLORS.success);
    expect(getOutcomeColor('pass')).toBe(OUTCOME_COLORS.pass);
    expect(getOutcomeColor('ok')).toBe(OUTCOME_COLORS.ok);
  });

  it('should return red for failure outcomes', () => {
    expect(getOutcomeColor('failure')).toBe(OUTCOME_COLORS.failure);
    expect(getOutcomeColor('fail')).toBe(OUTCOME_COLORS.fail);
    expect(getOutcomeColor('error')).toBe(OUTCOME_COLORS.error);
  });

  it('should return gray for cancel outcomes', () => {
    expect(getOutcomeColor('cancel')).toBe(OUTCOME_COLORS.cancel);
    expect(getOutcomeColor('cancelled')).toBe(OUTCOME_COLORS.cancelled);
  });

  it('should return dark gray for skip outcomes', () => {
    expect(getOutcomeColor('skip')).toBe(OUTCOME_COLORS.skip);
    expect(getOutcomeColor('skipped')).toBe(OUTCOME_COLORS.skipped);
  });

  it('should be case-insensitive', () => {
    expect(getOutcomeColor('SUCCESS')).toBe(OUTCOME_COLORS.success);
    expect(getOutcomeColor('FAILURE')).toBe(OUTCOME_COLORS.failure);
    expect(getOutcomeColor('Pass')).toBe(OUTCOME_COLORS.pass);
  });

  it('should return default gray for unknown outcomes', () => {
    expect(getOutcomeColor('unknown')).toBe('#B7B7B7');
    expect(getOutcomeColor('pending')).toBe('#B7B7B7');
    expect(getOutcomeColor('')).toBe('#B7B7B7');
  });
});
