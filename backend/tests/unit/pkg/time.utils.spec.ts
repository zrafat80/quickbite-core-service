import { TimeUtils } from 'src/pkg/utils/time.utils';

describe('TimeUtils', () => {
  it('converts common durations to milliseconds', () => {
    expect(TimeUtils.secondsToMs(2)).toBe(2_000);
    expect(TimeUtils.minutesToMs(2)).toBe(120_000);
    expect(TimeUtils.hoursToMs(2)).toBe(7_200_000);
    expect(TimeUtils.daysToMs(2)).toBe(172_800_000);
    expect(TimeUtils.minutesToSeconds(2)).toBe(120);
    expect(TimeUtils.hoursToSeconds(2)).toBe(7_200);
    expect(TimeUtils.daysToSeconds(2)).toBe(172_800);
  });

  it('adds days and hours without mutating the input', () => {
    const input = new Date('2026-06-07T10:00:00.000Z');
    expect(TimeUtils.addDays(input, 2)).toEqual(
      new Date('2026-06-09T10:00:00.000Z'),
    );
    expect(TimeUtils.addHours(input, 2)).toEqual(
      new Date('2026-06-07T12:00:00.000Z'),
    );
    expect(input).toEqual(new Date('2026-06-07T10:00:00.000Z'));
  });
});
