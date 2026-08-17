/**
 * @file helpers.js
 * @description Senior-architect level reusable JavaScript utility library containing
 * robust helper functions for Arrays, Strings, Dates, and Numbers/Currencies.
 * Includes defensive edge-case validations, strict error handling, and comprehensive JSDoc.
 * @module utils/helpers
 */

/* ==========================================================================
   ARRAY UTILITIES
   ========================================================================== */

/**
 * Splits an array into smaller chunks of specified size.
 *
 * @template T
 * @param {T[]} array - The array to chunk.
 * @param {number} [size=1] - The size of each chunk (must be a positive integer).
 * @returns {T[][]} An array of chunked arrays. If the input array is empty, returns an empty array.
 * @throws {TypeError} If `array` is not an Array or `size` is not a number.
 * @throws {RangeError} If `size` is less than 1 or not an integer.
 *
 * @example
 * chunk(['a', 'b', 'c', 'd'], 2);
 * // returns [['a', 'b'], ['c', 'd']]
 *
 * @example
 * chunk(['a', 'b', 'c'], 2);
 * // returns [['a', 'b'], ['c']]
 */
export const chunk = (array, size = 1) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`[chunk] Expected an Array for the first argument, received: ${typeof array} (${array})`);
  }

  if (typeof size !== 'number' || Number.isNaN(size)) {
    throw new TypeError(`[chunk] Expected a number for the chunk size, received: ${typeof size}`);
  }

  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`[chunk] Chunk size must be an integer greater than or equal to 1, received: ${size}`);
  }

  if (array.length === 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

/**
 * Removes duplicate items from an array. Supports primitive values and objects via key selector or transform function.
 *
 * @template T
 * @param {T[]} array - The array from which to remove duplicates.
 * @param {string|((item: T) => unknown)|null} [keyOrFn=null] - Optional property name or mapping function to determine uniqueness.
 * @returns {T[]} A new array containing only unique elements (original array is not mutated).
 * @throws {TypeError} If `array` is not an Array or `keyOrFn` is of an invalid type.
 *
 * @example
 * unique([1, 2, 2, 3, 4, 4, 1]);
 * // returns [1, 2, 3, 4]
 *
 * @example
 * unique([{ id: 1, name: 'Alice' }, { id: 1, name: 'Bob' }, { id: 1, name: 'Alice' }], 'id');
 * // returns [{ id: 1, name: 'Alice' }, { id: 1, name: 'Bob' }]
 *
 * @example
 * unique(['apple', 'Apple', 'banana'], item => item.toLowerCase());
 * // returns ['apple', 'banana']
 */
export const unique = (array, keyOrFn = null) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`[unique] Expected an Array for the first argument, received: ${typeof array} (${array})`);
  }

  if (array.length === 0) {
    return [];
  }

  if (keyOrFn === null || keyOrFn === undefined) {
    return Array.from(new Set(array));
  }

  if (typeof keyOrFn !== 'string' && typeof keyOrFn !== 'function') {
    throw new TypeError(`[unique] Expected a string property name or a function for keyOrFn, received: ${typeof keyOrFn}`);
  }

  const seen = new Set();
  const result = [];

  for (const item of array) {
    let key;
    if (typeof keyOrFn === 'function') {
      key = keyOrFn(item);
    } else if (item !== null && typeof item === 'object' && keyOrFn in item) {
      key = item[keyOrFn];
    } else {
      key = item;
    }

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
};

/**
 * Creates a new array with elements randomly shuffled using the Fisher-Yates algorithm.
 * Does not mutate the source array.
 *
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} A new array with elements in randomized order.
 * @throws {TypeError} If `array` is not an Array.
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]);
 * // returns e.g. [3, 1, 5, 2, 4]
 */
export const shuffle = (array) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`[shuffle] Expected an Array for the first argument, received: ${typeof array} (${array})`);
  }

  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

/**
 * Groups elements of an array according to a key selector string or callback function.
 *
 * @template T
 * @param {T[]} array - The array to group.
 * @param {string|((item: T) => string|number)} keyOrFn - Property name or callback returning group key.
 * @returns {Record<string, T[]>} An object with keys mapped to array groups.
 * @throws {TypeError} If `array` is not an Array, or `keyOrFn` is invalid.
 *
 * @example
 * groupBy(['one', 'two', 'three'], 'length');
 * // returns { '3': ['one', 'two'], '5': ['three'] }
 *
 * @example
 * groupBy([6.1, 4.2, 6.3], Math.floor);
 * // returns { '4': [4.2], '6': [6.1, 6.3] }
 */
export const groupBy = (array, keyOrFn) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`[groupBy] Expected an Array for the first argument, received: ${typeof array} (${array})`);
  }

  if (typeof keyOrFn !== 'string' && typeof keyOrFn !== 'function') {
    throw new TypeError(`[groupBy] Expected a string or function for keyOrFn, received: ${typeof keyOrFn}`);
  }

  const result = {};
  for (const item of array) {
    let groupKey;
    if (typeof keyOrFn === 'function') {
      groupKey = String(keyOrFn(item));
    } else if (item !== null && typeof item === 'object') {
      groupKey = String(item[keyOrFn]);
    } else {
      groupKey = String(item);
    }

    if (!Object.prototype.hasOwnProperty.call(result, groupKey)) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }

  return result;
};

/**
 * Recursively flattens an array up to the specified depth.
 *
 * @template T
 * @param {T[]} array - The array to flatten.
 * @param {number} [depth=1] - The maximum recursion depth (default 1).
 * @returns {unknown[]} A new flattened array.
 * @throws {TypeError} If `array` is not an Array or `depth` is not a valid number.
 * @throws {RangeError} If `depth` is negative.
 *
 * @example
 * flatten([1, [2, [3, [4]], 5]], 2);
 * // returns [1, 2, 3, [4], 5]
 */
export const flatten = (array, depth = 1) => {
  if (!Array.isArray(array)) {
    throw new TypeError(`[flatten] Expected an Array for the first argument, received: ${typeof array} (${array})`);
  }

  if (typeof depth !== 'number' || Number.isNaN(depth)) {
    throw new TypeError(`[flatten] Expected a number for depth, received: ${typeof depth}`);
  }

  if (depth < 0) {
    throw new RangeError(`[flatten] Depth must be greater than or equal to 0, received: ${depth}`);
  }

  return array.flat(depth);
};


/* ==========================================================================
   STRING UTILITIES
   ========================================================================== */

/**
 * Converts a string into Title Case while intelligently handling special characters,
 * delimiters, and standard casing.
 *
 * @param {string} str - The string to convert.
 * @returns {string} The title-cased string.
 * @throws {TypeError} If `str` is not a string.
 *
 * @example
 * toTitleCase('hello world of javascript');
 * // returns 'Hello World Of Javascript'
 *
 * @example
 * toTitleCase('senior-software_architect-engineer');
 * // returns 'Senior Software Architect Engineer'
 */
export const toTitleCase = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(`[toTitleCase] Expected a string, received: ${typeof str} (${str})`);
  }

  const trimmed = str.trim();
  if (trimmed.length === 0) {
    return '';
  }

  // Normalize delimiters (underscores, hyphens, multiple spaces) into spaces
  const normalized = trimmed.replace(/[-_]+/g, ' ');

  return normalized.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
};

/**
 * Truncates a string to a specified maximum length, appending an ellipsis or custom suffix if cut.
 *
 * @param {string} str - The target string.
 * @param {number} length - The maximum allowed length including the suffix.
 * @param {string} [suffix='...'] - The suffix to append if truncated (default: '...').
 * @returns {string} The truncated string or the original string if length is sufficient.
 * @throws {TypeError} If `str` or `suffix` is not a string, or `length` is not a number.
 * @throws {RangeError} If `length` is negative or less than suffix length when truncating.
 *
 * @example
 * truncate('JavaScript is awesome and versatile', 15);
 * // returns 'JavaScript is...'
 *
 * @example
 * truncate('Short text', 20);
 * // returns 'Short text'
 */
export const truncate = (str, length, suffix = '...') => {
  if (typeof str !== 'string') {
    throw new TypeError(`[truncate] Expected a string for the first argument, received: ${typeof str} (${str})`);
  }

  if (typeof length !== 'number' || Number.isNaN(length) || !Number.isInteger(length)) {
    throw new TypeError(`[truncate] Expected an integer for length, received: ${typeof length} (${length})`);
  }

  if (typeof suffix !== 'string') {
    throw new TypeError(`[truncate] Expected a string for suffix, received: ${typeof suffix}`);
  }

  if (length < 0) {
    throw new RangeError(`[truncate] Length must be non-negative, received: ${length}`);
  }

  if (str.length <= length) {
    return str;
  }

  if (length < suffix.length) {
    return suffix.slice(0, length);
  }

  return str.slice(0, length - suffix.length) + suffix;
};

/**
 * Converts a string into a URL-friendly slug (lowercased, normalized, accents removed, special chars replaced).
 *
 * @param {string} str - The raw string to slugify.
 * @returns {string} The sanitized, URL-safe slug.
 * @throws {TypeError} If `str` is not a string.
 *
 * @example
 * slugify('Hello World! This is JavaScript in 2026.');
 * // returns 'hello-world-this-is-javascript-in-2026'
 *
 * @example
 * slugify('  Crème Brûlée & Café au Lait -- Special!  ');
 * // returns 'creme-brulee-cafe-au-lait-special'
 */
export const slugify = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(`[slugify] Expected a string, received: ${typeof str} (${str})`);
  }

  return str
    .normalize('NFKD') // Normalize unicode accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except space & hyphen
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores and consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from beginning and end
};

/**
 * Capitalizes the very first letter of a string.
 *
 * @param {string} str - The input string.
 * @returns {string} The capitalized string.
 * @throws {TypeError} If `str` is not a string.
 *
 * @example
 * capitalize('developer');
 * // returns 'Developer'
 */
export const capitalize = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(`[capitalize] Expected a string, received: ${typeof str} (${str})`);
  }

  if (str.length === 0) {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Masks sensitive characters in a string (e.g. credit card numbers, email, phone numbers).
 *
 * @param {string} str - The sensitive string to mask.
 * @param {number} [visibleStart=0] - Number of unmasked characters at start.
 * @param {number} [visibleEnd=4] - Number of unmasked characters at end.
 * @param {string} [maskChar='*'] - Character used for masking.
 * @returns {string} The masked string.
 * @throws {TypeError} If `str` is not a string or parameters are of wrong types.
 *
 * @example
 * maskString('1234567812345678', 4, 4, '*');
 * // returns '1234********5678'
 *
 * @example
 * maskString('user@example.com', 2, 4);
 * // returns 'us**********com'
 */
export const maskString = (str, visibleStart = 0, visibleEnd = 4, maskChar = '*') => {
  if (typeof str !== 'string') {
    throw new TypeError(`[maskString] Expected a string, received: ${typeof str} (${str})`);
  }

  if (typeof visibleStart !== 'number' || typeof visibleEnd !== 'number') {
    throw new TypeError(`[maskString] visibleStart and visibleEnd must be numbers`);
  }

  if (typeof maskChar !== 'string' || maskChar.length === 0) {
    throw new TypeError(`[maskString] maskChar must be a non-empty string`);
  }

  const len = str.length;
  if (len <= visibleStart + visibleEnd) {
    return str;
  }

  const startPart = str.slice(0, visibleStart);
  const endPart = visibleEnd > 0 ? str.slice(-visibleEnd) : '';
  const maskedLength = len - visibleStart - visibleEnd;
  const maskedPart = maskChar.repeat(maskedLength);

  return startPart + maskedPart + endPart;
};


/* ==========================================================================
   DATE UTILITIES
   ========================================================================== */

/**
 * Validates if an input is a valid Date object, valid date timestamp, or valid ISO date string.
 *
 * @param {unknown} value - The value to test.
 * @returns {boolean} True if the input represents a valid, parseable date.
 *
 * @example
 * isValidDate(new Date()); // true
 * isValidDate('2026-08-17'); // true
 * isValidDate('invalid-date'); // false
 * isValidDate(null); // false
 */
export const isValidDate = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return !Number.isNaN(d.getTime());
  }

  return false;
};

/**
 * Internal helper to safely coerce input into a valid Date object or throw a descriptive error.
 *
 * @private
 * @param {Date|string|number} dateInput - The date representation.
 * @param {string} caller - Function name for error reporting.
 * @returns {Date} Valid Date instance.
 * @throws {TypeError} If input cannot be converted to a valid Date.
 */
const toValidDate = (dateInput, caller) => {
  if (!isValidDate(dateInput)) {
    throw new TypeError(`[${caller}] Expected a valid Date, ISO string, or timestamp, received: ${typeof dateInput} (${dateInput})`);
  }
  return dateInput instanceof Date ? dateInput : new Date(dateInput);
};

/**
 * Formats a date into a formatted string pattern or localized string representation.
 * Supported token replacements:
 * - `YYYY`: Full 4-digit year (e.g. 2026)
 * - `YY`: 2-digit year (e.g. 26)
 * - `MM`: 2-digit month (01-12)
 * - `M`: 1-2 digit month (1-12)
 * - `DD`: 2-digit day of month (01-31)
 * - `D`: 1-2 digit day of month (1-31)
 * - `HH`: 2-digit 24-hour (00-23)
 * - `mm`: 2-digit minute (00-59)
 * - `ss`: 2-digit second (00-59)
 * - `MMMM`: Full month name in specified locale (e.g. August)
 * - `MMM`: Short month name in specified locale (e.g. Aug)
 * - `dddd`: Full weekday name (e.g. Monday)
 *
 * @param {Date|string|number} date - Date object, ISO string, or timestamp.
 * @param {string} [format='YYYY-MM-DD'] - The format template string.
 * @param {string} [locale='en-US'] - BCP 47 language tag for month/day names.
 * @returns {string} The formatted date string.
 * @throws {TypeError} If date or format string is invalid.
 *
 * @example
 * formatDate(new Date(2026, 7, 17), 'YYYY-MM-DD');
 * // returns '2026-08-17'
 *
 * @example
 * formatDate(new Date(2026, 7, 17), 'dddd, MMMM D, YYYY');
 * // returns 'Monday, August 17, 2026'
 */
export const formatDate = (date, format = 'YYYY-MM-DD', locale = 'en-US') => {
  const d = toValidDate(date, 'formatDate');

  if (typeof format !== 'string') {
    throw new TypeError(`[formatDate] Expected a string for format template, received: ${typeof format}`);
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  const pad = (n) => String(n).padStart(2, '0');

  // Month names and weekdays via Intl
  const fullMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
  const shortMonth = new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
  const fullWeekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);

  return format
    .replace(/\bYYYY\b/g, String(year))
    .replace(/\bYY\b/g, String(year).slice(-2))
    .replace(/\bMMMM\b/g, fullMonth)
    .replace(/\bMMM\b/g, shortMonth)
    .replace(/\bMM\b/g, pad(month))
    .replace(/\bM\b/g, String(month))
    .replace(/\bDD\b/g, pad(day))
    .replace(/\bD\b/g, String(day))
    .replace(/\bHH\b/g, pad(hours))
    .replace(/\bmm\b/g, pad(minutes))
    .replace(/\bss\b/g, pad(seconds))
    .replace(/\bdddd\b/g, fullWeekday);
};

/**
 * Calculates the number of full calendar or elapsed days between two dates.
 *
 * @param {Date|string|number} startDate - The start date.
 * @param {Date|string|number} endDate - The end date.
 * @param {boolean} [absolute=true] - Whether to return absolute number of days (default: true).
 * @returns {number} The difference in integer days.
 * @throws {TypeError} If either date is invalid.
 *
 * @example
 * daysBetween('2026-08-10', '2026-08-17');
 * // returns 7
 *
 * @example
 * daysBetween('2026-08-20', '2026-08-10', false);
 * // returns -10
 */
export const daysBetween = (startDate, endDate, absolute = true) => {
  const start = toValidDate(startDate, 'daysBetween');
  const end = toValidDate(endDate, 'daysBetween');

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / MS_PER_DAY);

  return absolute ? Math.abs(diffDays) : diffDays;
};

/**
 * Checks whether a given date falls on a weekend (Saturday or Sunday).
 *
 * @param {Date|string|number} date - The date to check.
 * @returns {boolean} True if Saturday or Sunday, false otherwise.
 * @throws {TypeError} If the date is invalid.
 *
 * @example
 * isWeekend('2026-08-16'); // Sunday -> returns true
 * isWeekend('2026-08-17'); // Monday -> returns false
 */
export const isWeekend = (date) => {
  const d = toValidDate(date, 'isWeekend');
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Calculates and returns a localized human-readable relative time string (e.g., "5 minutes ago", "in 2 days", "yesterday").
 * Uses modern standard `Intl.RelativeTimeFormat`.
 *
 * @param {Date|string|number} date - Target date.
 * @param {Date|string|number} [baseDate=new Date()] - Comparison reference date (defaults to current time).
 * @param {string} [locale='en-US'] - BCP 47 language tag (e.g. 'en-US', 'en-IN').
 * @returns {string} Relative time string.
 * @throws {TypeError} If date or baseDate is invalid.
 *
 * @example
 * getRelativeTime(new Date(Date.now() - 60000));
 * // returns '1 minute ago'
 *
 * @example
 * getRelativeTime(new Date(Date.now() + 86400000 * 3));
 * // returns 'in 3 days'
 */
export const getRelativeTime = (date, baseDate = new Date(), locale = 'en-US') => {
  const d = toValidDate(date, 'getRelativeTime');
  const base = toValidDate(baseDate, 'getRelativeTime');

  const diffSeconds = Math.round((d.getTime() - base.getTime()) / 1000);

  if (Math.abs(diffSeconds) < 10) {
    return 'just now';
  }

  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 },
  ];

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const unit of units) {
    if (Math.abs(diffSeconds) >= unit.seconds || unit.name === 'second') {
      const count = Math.round(diffSeconds / unit.seconds);
      return rtf.format(count, unit.name);
    }
  }

  return 'just now';
};


/* ==========================================================================
   NUMBER & CURRENCY UTILITIES
   ========================================================================== */

/**
 * Formats a numeric value into a localized currency string using `Intl.NumberFormat`.
 *
 * @param {number|string} amount - The numeric amount to format.
 * @param {string} [currencyCode='INR'] - ISO 4217 currency code (e.g. 'INR', 'USD', 'EUR', 'GBP', 'JPY').
 * @param {string} [locale='en-IN'] - BCP 47 locale string (e.g. 'en-IN' for Indian numbering, 'en-US' for US).
 * @param {Intl.NumberFormatOptions} [options={}] - Additional `Intl.NumberFormat` options.
 * @returns {string} The localized currency string.
 * @throws {TypeError} If amount cannot be parsed into a finite number.
 * @throws {RangeError} If currency code is malformed.
 *
 * @example
 * formatCurrency(1250000.5, 'INR', 'en-IN');
 * // returns '₹12,50,000.50'
 *
 * @example
 * formatCurrency(1250000.5, 'USD', 'en-US');
 * // returns '$1,250,000.50'
 *
 * @example
 * formatCurrency('499.99', 'EUR', 'de-DE');
 * // returns '499,99 €'
 */
export const formatCurrency = (amount, currencyCode = 'INR', locale = 'en-IN', options = {}) => {
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount;

  if (typeof numericAmount !== 'number' || Number.isNaN(numericAmount) || !Number.isFinite(numericAmount)) {
    throw new TypeError(`[formatCurrency] Expected a finite number or numeric string, received: ${typeof amount} (${amount})`);
  }

  if (typeof currencyCode !== 'string' || currencyCode.trim().length !== 3) {
    throw new RangeError(`[formatCurrency] Expected a 3-letter ISO 4217 currency code, received: ${currencyCode}`);
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      ...options,
    });
    return formatter.format(numericAmount);
  } catch (error) {
    throw new Error(`[formatCurrency] Failed to format with locale '${locale}' and currency '${currencyCode}': ${error.message}`);
  }
};

/**
 * Formats a large number into a compact, human-readable representation (e.g., 1.5K, 2.3M, 1.2Cr).
 *
 * @param {number|string} number - The number to format.
 * @param {string} [locale='en-US'] - BCP 47 locale (e.g. 'en-US' -> 1.5M, 'en-IN' -> 1.5L / 1.5Cr).
 * @param {Intl.NumberFormatOptions} [options={}] - Custom options.
 * @returns {string} Compact formatted string.
 * @throws {TypeError} If input is not a finite number.
 *
 * @example
 * formatCompactNumber(1500000, 'en-US');
 * // returns '1.5M'
 *
 * @example
 * formatCompactNumber(125000, 'en-US');
 * // returns '125K'
 */
export const formatCompactNumber = (number, locale = 'en-US', options = {}) => {
  const num = typeof number === 'string' ? Number(number) : number;

  if (typeof num !== 'number' || Number.isNaN(num) || !Number.isFinite(num)) {
    throw new TypeError(`[formatCompactNumber] Expected a finite number, received: ${typeof number} (${number})`);
  }

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(num);
};

/**
 * Clamps a number to stay within a specified minimum and maximum boundary.
 *
 * @param {number} value - The number to clamp.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number} The clamped value.
 * @throws {TypeError} If any argument is not a finite number.
 * @throws {RangeError} If min is greater than max.
 *
 * @example
 * clamp(150, 0, 100);
 * // returns 100
 *
 * @example
 * clamp(-25, 0, 100);
 * // returns 0
 *
 * @example
 * clamp(42, 0, 100);
 * // returns 42
 */
export const clamp = (value, min, max) => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError(`[clamp] Value must be a finite number, received: ${value}`);
  }
  if (typeof min !== 'number' || Number.isNaN(min) || !Number.isFinite(min)) {
    throw new TypeError(`[clamp] Minimum must be a finite number, received: ${min}`);
  }
  if (typeof max !== 'number' || Number.isNaN(max) || !Number.isFinite(max)) {
    throw new TypeError(`[clamp] Maximum must be a finite number, received: ${max}`);
  }
  if (min > max) {
    throw new RangeError(`[clamp] Minimum bound (${min}) cannot be greater than maximum bound (${max})`);
  }

  return Math.min(Math.max(value, min), max);
};

/**
 * Formats a decimal ratio or number as a formatted percentage string.
 *
 * @param {number|string} value - The numeric ratio (e.g. 0.856) or percentage.
 * @param {number} [decimals=2] - Number of decimal places to include.
 * @param {string} [locale='en-US'] - BCP 47 locale.
 * @returns {string} Formatted percentage string (e.g. "85.60%").
 * @throws {TypeError} If value or decimals is not a valid number.
 *
 * @example
 * toPercentage(0.8564, 2);
 * // returns '85.64%'
 *
 * @example
 * toPercentage(1.25, 1);
 * // returns '125.0%'
 */
export const toPercentage = (value, decimals = 2, locale = 'en-US') => {
  const num = typeof value === 'string' ? Number(value) : value;

  if (typeof num !== 'number' || Number.isNaN(num) || !Number.isFinite(num)) {
    throw new TypeError(`[toPercentage] Expected a finite number, received: ${typeof value} (${value})`);
  }

  if (typeof decimals !== 'number' || decimals < 0 || !Number.isInteger(decimals)) {
    throw new RangeError(`[toPercentage] Decimals must be a non-negative integer, received: ${decimals}`);
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(num);
};

/**
 * Accurately rounds a number to a specified number of decimal places avoiding floating-point precision quirks.
 *
 * @param {number|string} number - The number to round.
 * @param {number} [decimals=2] - Decimal places to round to.
 * @returns {number} The precisely rounded number.
 * @throws {TypeError} If number or decimals is invalid.
 *
 * @example
 * roundTo(1.005, 2);
 * // returns 1.01 (standard Math.round gives 1 due to IEEE 754 float imprecision)
 *
 * @example
 * roundTo(123.4567, 3);
 * // returns 123.457
 */
export const roundTo = (number, decimals = 2) => {
  const num = typeof number === 'string' ? Number(number) : number;

  if (typeof num !== 'number' || Number.isNaN(num) || !Number.isFinite(num)) {
    throw new TypeError(`[roundTo] Expected a finite number, received: ${typeof number} (${number})`);
  }

  if (typeof decimals !== 'number' || decimals < 0 || !Number.isInteger(decimals)) {
    throw new RangeError(`[roundTo] Decimals must be a non-negative integer, received: ${decimals}`);
  }

  // Use scientific exponential notation shifting to avoid floating-point binary issues
  return Number(Math.round(Number(`${num}e+${decimals}`)) + `e-${decimals}`);
};
