import { dateTime } from "@grafana/data";

// Extract and test the datetime formatting logic
describe("HistoryBarChart datetime formatting", () => {
  const formatDateTime = (
    dateTimeStr: string,
    dateTimeZone: "browser" | "utc" = "browser",
    timeZone?: string,
  ): string => {
    if (!dateTimeStr) {
      return "";
    }

    // Parse the datetime - handle various formats
    let dt;
    if (!isNaN(Number(dateTimeStr))) {
      const num = Number(dateTimeStr);
      // If timestamp is less than 10000000000, it's likely in seconds, otherwise milliseconds
      dt = dateTime(num < 10000000000 ? num * 1000 : num);
    } else {
      // It's a string (ISO format, etc.)
      dt = dateTime(dateTimeStr);
    }

    // Check if the date is valid
    if (!dt.isValid()) {
      return dateTimeStr;
    }

    // Determine which timezone to display
    let formatted: string;
    if (dateTimeZone === "utc") {
      // Display in UTC
      formatted = dt.utc().format("YYYY-MM-DD HH:mm:ss");
      return formatted + " UTC";
    } else {
      // Display in browser's local timezone
      formatted = dt.format("YYYY-MM-DD HH:mm:ss");
      return formatted;
    }
  };

  describe("ISO 8601 date strings", () => {
    it("should format ISO 8601 datetime string in browser timezone", () => {
      const isoString = "2024-01-15T14:30:45Z";
      const result = formatDateTime(isoString, "browser");

      // Should return a formatted date (exact value depends on browser timezone)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result).not.toContain("1970-01-01");
    });

    it("should format ISO 8601 datetime string in UTC", () => {
      const isoString = "2024-01-15T14:30:45Z";
      const result = formatDateTime(isoString, "utc");

      expect(result).toBe("2024-01-15 14:30:45 UTC");
    });

    it("should format ISO datetime with timezone offset", () => {
      const isoString = "2024-01-15T14:30:45+01:00";
      const result = formatDateTime(isoString, "utc");

      // UTC time should be 1 hour earlier
      expect(result).toBe("2024-01-15 13:30:45 UTC");
    });
  });

  describe("Unix timestamps in milliseconds", () => {
    it("should format millisecond timestamp correctly", () => {
      // January 15, 2024 14:30:45 UTC in milliseconds
      const timestamp = "1705329045000";
      const result = formatDateTime(timestamp, "utc");

      expect(result).toBe("2024-01-15 14:30:45 UTC");
    });

    it("should handle millisecond timestamp as number string", () => {
      const timestamp = "1705329045000";
      const result = formatDateTime(timestamp, "utc");

      expect(result).not.toContain("1970-01-01");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/);
    });
  });

  describe("Unix timestamps in seconds", () => {
    it("should format second timestamp correctly", () => {
      // January 15, 2024 14:30:45 UTC in seconds
      const timestamp = "1705329045";
      const result = formatDateTime(timestamp, "utc");

      expect(result).toBe("2024-01-15 14:30:45 UTC");
    });

    it("should not confuse seconds with epoch time", () => {
      const timestamp = "1705329045";
      const result = formatDateTime(timestamp, "utc");

      expect(result).not.toContain("1970-01-01");
    });
  });

  describe("Edge cases", () => {
    it("should return empty string for empty input", () => {
      expect(formatDateTime("")).toBe("");
    });

    it("should return original value for invalid date", () => {
      // Suppress expected moment.js warning for invalid date format
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const invalidDate = "not-a-date";
      const result = formatDateTime(invalidDate);

      // Should return original value on parse failure
      expect(result).toBe(invalidDate);

      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });

    it("should handle very small numbers as seconds", () => {
      // 2 seconds after epoch
      const timestamp = "2";
      const result = formatDateTime(timestamp, "utc");

      // Should be treated as seconds, so 2 * 1000 = 2000ms = 1970-01-01 00:00:02
      expect(result).toBe("1970-01-01 00:00:02 UTC");
    });
  });

  describe("Timezone handling", () => {
    it("should include UTC label when dateTimeZone is utc", () => {
      const isoString = "2024-01-15T14:30:45Z";
      const result = formatDateTime(isoString, "utc");

      expect(result).toContain(" UTC");
    });

    it("should not include UTC label when dateTimeZone is browser", () => {
      const isoString = "2024-01-15T14:30:45Z";
      const result = formatDateTime(isoString, "browser");

      expect(result).not.toContain(" UTC");
    });
  });
});
