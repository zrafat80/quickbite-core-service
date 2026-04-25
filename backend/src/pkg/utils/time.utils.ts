// src/lib/utils/time.utils.ts

export const TimeUtils = {
  /**
   * Conversions to Milliseconds (Great for Cookies and standard tokens)
   */
  secondsToMs: (seconds: number) => seconds * 1000,
  minutesToMs: (minutes: number) => minutes * 60 * 1000,
  hoursToMs: (hours: number) => hours * 60 * 60 * 1000,
  daysToMs: (days: number) => days * 24 * 60 * 60 * 1000,

  /**
   * Conversions to Seconds (Great for JWT expiration payloads)
   */
  minutesToSeconds: (minutes: number) => minutes * 60,
  hoursToSeconds: (hours: number) => hours * 60 * 60,
  daysToSeconds: (days: number) => days * 24 * 60 * 60,

  /**
   * Date Manipulation (Great for database expirations)
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addHours: (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },
};
