"use strict";
// src/lib/utils/time.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUtils = void 0;
exports.TimeUtils = {
    /**
     * Conversions to Milliseconds (Great for Cookies and standard tokens)
     */
    secondsToMs: function (seconds) { return seconds * 1000; },
    minutesToMs: function (minutes) { return minutes * 60 * 1000; },
    hoursToMs: function (hours) { return hours * 60 * 60 * 1000; },
    daysToMs: function (days) { return days * 24 * 60 * 60 * 1000; },
    /**
     * Conversions to Seconds (Great for JWT expiration payloads)
     */
    minutesToSeconds: function (minutes) { return minutes * 60; },
    hoursToSeconds: function (hours) { return hours * 60 * 60; },
    daysToSeconds: function (days) { return days * 24 * 60 * 60; },
    /**
     * Date Manipulation (Great for database expirations)
     */
    addDays: function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    addHours: function (date, hours) {
        var result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    },
};
