/**
 * @file app.js
 * @description Demonstration script that imports the ES6 utility library from `./utils/helpers.js`
 * and executes comprehensive test suites covering normal operations, edge cases,
 * defensive error handling, and type validation via console logs.
 */

import {
  // Array Utilities
  chunk,
  unique,
  shuffle,
  groupBy,
  flatten,

  // String Utilities
  toTitleCase,
  truncate,
  slugify,
  capitalize,
  maskString,

  // Date Utilities
  isValidDate,
  formatDate,
  daysBetween,
  isWeekend,
  getRelativeTime,

  // Number & Currency Utilities
  formatCurrency,
  formatCompactNumber,
  clamp,
  toPercentage,
  roundTo,
} from './utils/helpers.js';

console.log(
  '%c🚀 JavaScript Utility Library Test Suite & Edge Case Demonstrator',
  'background: #2563eb; color: #ffffff; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 4px;'
);
console.log('Testing ES6 modules loaded from ./utils/helpers.js\n');

/* ==========================================================================
   1. ARRAY UTILITIES TEST SUITE
   ========================================================================== */
console.group('📦 1. Array Utilities');

// --- chunk ---
console.group('🔹 chunk(array, size)');
console.log('Standard Chunk (size 2):', chunk(['a', 'b', 'c', 'd', 'e'], 2));
console.log('Chunk with remainder (size 3):', chunk([1, 2, 3, 4, 5, 6, 7], 3));
console.log('Edge Case - Empty Array:', chunk([], 3));
console.log('Edge Case - Size larger than array length:', chunk([1, 2], 10));
console.log('Edge Case - Default size (1):', chunk(['x', 'y', 'z']));

try {
  console.log('Defensive Check - Non-array input:');
  chunk('invalid-string', 2);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}

try {
  console.log('Defensive Check - Zero chunk size:');
  chunk([1, 2, 3], 0);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}

try {
  console.log('Defensive Check - Negative chunk size:');
  chunk([1, 2, 3], -2);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- unique ---
console.group('🔹 unique(array, keyOrFn)');
console.log('Primitive Duplicates:', unique([1, 2, 2, 3, 4, 4, 1, 5, 5]));
console.log('String Case-Sensitive Duplicates:', unique(['apple', 'orange', 'apple', 'banana', 'orange']));
console.log('Objects by Key Selector ("id"):', unique([
  { id: 101, name: 'Alice' },
  { id: 102, name: 'Bob' },
  { id: 101, name: 'Alice Duplicate' },
  { id: 103, name: 'Charlie' }
], 'id'));

console.log('Objects/Strings by Mapping Function (case-insensitive):', unique(
  ['React', 'vue', 'REACT', 'Angular', 'VUE', 'react'],
  (item) => item.toLowerCase()
));

console.log('Edge Case - Empty Array:', unique([]));
console.log('Edge Case - Mixed types with null/undefined:', unique([1, null, undefined, 1, null, '1', 2]));

try {
  console.log('Defensive Check - Null array input:');
  unique(null);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- shuffle ---
console.group('🔹 shuffle(array)');
const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const shuffledArray = shuffle(originalArray);
console.log('Original Array (Unmutated):', originalArray);
console.log('Shuffled Output (Fisher-Yates):', shuffledArray);
console.log('Edge Case - Single element:', shuffle(['alone']));
console.log('Edge Case - Empty array:', shuffle([]));

try {
  console.log('Defensive Check - Undefined input:');
  shuffle(undefined);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- groupBy ---
console.group('🔹 groupBy(array, keyOrFn)');
const users = [
  { name: 'Alex', role: 'admin', age: 28 },
  { name: 'Sarah', role: 'developer', age: 24 },
  { name: 'Michael', role: 'developer', age: 31 },
  { name: 'Emily', role: 'designer', age: 26 },
  { name: 'David', role: 'admin', age: 35 }
];
console.log('Group by Property Name ("role"):', groupBy(users, 'role'));
console.log('Group by Callback Function (age group):', groupBy(users, (u) => (u.age >= 30 ? '30+' : '<30')));

try {
  console.log('Defensive Check - Invalid keyOrFn type:');
  groupBy(users, 12345);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- flatten ---
console.group('🔹 flatten(array, depth)');
console.log('Depth 1 Flatten:', flatten([1, [2, 3], [4, [5, 6]]]));
console.log('Depth 2 Flatten:', flatten([1, [2, [3, [4, 5]]]], 2));
console.log('Deep Flatten (Infinity):', flatten([1, [2, [3, [4, [5, [6]]]]]], Infinity));

try {
  console.log('Defensive Check - Negative depth:');
  flatten([1, 2], -1);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();

console.groupEnd(); // End Array Utilities


/* ==========================================================================
   2. STRING UTILITIES TEST SUITE
   ========================================================================== */
console.group('🔤 2. String Formatter Utilities');

// --- toTitleCase ---
console.group('🔹 toTitleCase(str)');
console.log('Normal sentence:', toTitleCase('the senior javascript software architect'));
console.log('Kebab-case string:', toTitleCase('responsive-web-design-patterns'));
console.log('Snake_case string:', toTitleCase('user_authentication_service_controller'));
console.log('Mixed casing with extra spaces:', toTitleCase('   mIxEd   cAsE   sTrInG  wItH   sPaCeS  '));
console.log('Edge Case - Empty String:', `"${toTitleCase('')}"`);

try {
  console.log('Defensive Check - Number passed to toTitleCase:');
  toTitleCase(12345);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- truncate ---
console.group('🔹 truncate(str, length, suffix)');
console.log('Truncate Long String:', truncate('JavaScript is a powerful language for modern full-stack web applications.', 35));
console.log('Custom Suffix ("[more]"):', truncate('Modular architecture promotes code reuse and maintainability.', 25, ' [more]'));
console.log('String shorter than length (No Truncation):', truncate('Short note', 20));
console.log('Edge Case - Length equal to string length:', truncate('Exact', 5));
console.log('Edge Case - Length smaller than suffix:', truncate('Long text here', 2, '...'));

try {
  console.log('Defensive Check - Negative length:');
  truncate('Hello', -5);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}

try {
  console.log('Defensive Check - Null input:');
  truncate(null, 10);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- slugify ---
console.group('🔹 slugify(str)');
console.log('Headline Slug:', slugify('Building Reusable JavaScript Modules in 2026!'));
console.log('Accents & Diacritics:', slugify('Café Déjà Vu & Crème Brûlée Menu'));
console.log('Special Symbols & Multiple Spaces:', slugify('  $100 off -- Flash Sale @ Bangalore!!  '));
console.log('Underscores and Dashes:', slugify('__admin__portal_v2.0_beta--release__'));

try {
  console.log('Defensive Check - Non-string input:');
  slugify({ title: 'My Post' });
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- capitalize ---
console.group('🔹 capitalize(str)');
console.log('Single word:', capitalize('developer'));
console.log('Already capitalized:', capitalize('Architect'));
console.log('Edge Case - Empty string:', `"${capitalize('')}"`);
console.log('Edge Case - Single letter:', capitalize('a'));
console.groupEnd();


// --- maskString ---
console.group('🔹 maskString(str, start, end, char)');
console.log('Credit Card Masking (visible start 4, end 4):', maskString('4532891234567890', 4, 4, '*'));
console.log('Phone Number Masking (visible start 3, end 2):', maskString('+919876543210', 3, 2, 'X'));
console.log('Email Masking (visible start 2, end 4):', maskString('johndoe@enterprise.org', 2, 4, '•'));
console.log('Short string (length <= visible bounds):', maskString('1234', 2, 2));

try {
  console.log('Defensive Check - Empty maskChar:');
  maskString('secret', 1, 1, '');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();

console.groupEnd(); // End String Utilities


/* ==========================================================================
   3. DATE UTILITIES TEST SUITE
   ========================================================================== */
console.group('📅 3. Date Helper Methods');

// --- isValidDate ---
console.group('🔹 isValidDate(value)');
console.log('Valid Date Object (new Date()):', isValidDate(new Date()));
console.log('Valid ISO String ("2026-08-17"):', isValidDate('2026-08-17'));
console.log('Valid Timestamp (1773750000000):', isValidDate(1773750000000));
console.log('Invalid String ("random-text"):', isValidDate('random-text'));
console.log('Invalid Date Object (new Date("invalid")):', isValidDate(new Date('invalid')));
console.log('Edge Case - Null / Undefined:', isValidDate(null), isValidDate(undefined));
console.groupEnd();


// --- formatDate ---
console.group('🔹 formatDate(date, formatStr, locale)');
const sampleDate = new Date(2026, 7, 17, 15, 45, 30); // 17 Aug 2026 15:45:30
console.log('ISO Pattern (YYYY-MM-DD):', formatDate(sampleDate, 'YYYY-MM-DD'));
console.log('European Pattern (DD/MM/YYYY):', formatDate(sampleDate, 'DD/MM/YYYY'));
console.log('Full Date & Time (DD/MM/YYYY HH:mm:ss):', formatDate(sampleDate, 'DD/MM/YYYY HH:mm:ss'));
console.log('Localized Long Format (dddd, MMMM D, YYYY):', formatDate(sampleDate, 'dddd, MMMM D, YYYY', 'en-US'));
console.log('Short Month & Year (MMM YYYY):', formatDate(sampleDate, 'MMM YYYY', 'en-US'));

try {
  console.log('Defensive Check - Invalid Date string:');
  formatDate('not-a-real-date', 'YYYY-MM-DD');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- daysBetween ---
console.group('🔹 daysBetween(startDate, endDate)');
console.log('7 Days Difference:', daysBetween('2026-08-10', '2026-08-17'));
console.log('Same Day (0 Days):', daysBetween('2026-08-17', '2026-08-17'));
console.log('30 Days Span:', daysBetween('2026-07-01', '2026-07-31'));
console.log('Signed difference (absolute = false):', daysBetween('2026-08-20', '2026-08-10', false));

try {
  console.log('Defensive Check - Missing date:');
  daysBetween(null, '2026-08-17');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- isWeekend ---
console.group('🔹 isWeekend(date)');
console.log('Sunday 2026-08-16 (Weekend?):', isWeekend('2026-08-16')); // true
console.log('Saturday 2026-08-15 (Weekend?):', isWeekend('2026-08-15')); // true
console.log('Monday 2026-08-17 (Weekend?):', isWeekend('2026-08-17')); // false
console.log('Friday 2026-08-21 (Weekend?):', isWeekend('2026-08-21')); // false
console.groupEnd();


// --- getRelativeTime ---
console.group('🔹 getRelativeTime(date, baseDate, locale)');
const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

console.log('Just now:', getRelativeTime(now));
console.log('5 minutes ago:', getRelativeTime(fiveMinutesAgo));
console.log('2 hours ago:', getRelativeTime(twoHoursAgo));
console.log('3 days ago:', getRelativeTime(threeDaysAgo));
console.log('In 2 days (future):', getRelativeTime(inTwoDays));
console.groupEnd();

console.groupEnd(); // End Date Utilities


/* ==========================================================================
   4. NUMBER & CURRENCY UTILITIES TEST SUITE
   ========================================================================== */
console.group('💰 4. Number & Currency Formatting Utilities');

// --- formatCurrency ---
console.group('🔹 formatCurrency(amount, currencyCode, locale)');
console.log('INR Format (Indian numbering system):', formatCurrency(1250000.5, 'INR', 'en-IN'));
console.log('USD Format ($):', formatCurrency(1250000.5, 'USD', 'en-US'));
console.log('EUR Format (€, German locale):', formatCurrency(4999.99, 'EUR', 'de-DE'));
console.log('GBP Format (£, UK locale):', formatCurrency(749.5, 'GBP', 'en-GB'));
console.log('JPY Format (¥, Japanese zero-decimal locale):', formatCurrency(150000, 'JPY', 'ja-JP'));
console.log('Numeric String Input ("9999.99"):', formatCurrency('9999.99', 'INR', 'en-IN'));

try {
  console.log('Defensive Check - Non-numeric string:');
  formatCurrency('five hundred dollars', 'USD', 'en-US');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}

try {
  console.log('Defensive Check - Invalid Currency Code (not 3 letters):');
  formatCurrency(100, 'DOLLARS', 'en-US');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}

try {
  console.log('Defensive Check - NaN amount:');
  formatCurrency(NaN, 'USD');
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- formatCompactNumber ---
console.group('🔹 formatCompactNumber(number, locale)');
console.log('Compact Millions (US):', formatCompactNumber(2500000, 'en-US'));
console.log('Compact Thousands (US):', formatCompactNumber(12500, 'en-US'));
console.log('Compact Billions (US):', formatCompactNumber(3400000000, 'en-US'));
console.log('Compact Lakhs/Crores (India):', formatCompactNumber(15000000, 'en-IN'));

try {
  console.log('Defensive Check - Null number:');
  formatCompactNumber(null);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- clamp ---
console.group('🔹 clamp(value, min, max)');
console.log('Value within bounds (50 in [0, 100]):', clamp(50, 0, 100));
console.log('Value above upper bound (150 in [0, 100]):', clamp(150, 0, 100));
console.log('Value below lower bound (-25 in [0, 100]):', clamp(-25, 0, 100));
console.log('Edge Case - Bounds equal (min === max):', clamp(25, 10, 10));

try {
  console.log('Defensive Check - min > max:');
  clamp(50, 100, 20);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- toPercentage ---
console.group('🔹 toPercentage(value, decimals, locale)');
console.log('Ratio 0.8564 with 2 decimals:', toPercentage(0.8564, 2));
console.log('Ratio 0.125 with 1 decimal:', toPercentage(0.125, 1));
console.log('Ratio 1.0 (100%):', toPercentage(1, 0));
console.log('Ratio 2.5 (250%):', toPercentage(2.5, 2));

try {
  console.log('Defensive Check - Negative decimals:');
  toPercentage(0.5, -1);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();


// --- roundTo ---
console.group('🔹 roundTo(number, decimals)');
console.log('Safe IEEE 754 Float Rounding (1.005 to 2 decimals):', roundTo(1.005, 2), '(Math.round gives 1 due to float precision)');
console.log('Round 123.4567 to 3 decimals:', roundTo(123.4567, 3));
console.log('Round 99.999 to 2 decimals:', roundTo(99.999, 2));
console.log('Round integer to 0 decimals:', roundTo(45.7, 0));

try {
  console.log('Defensive Check - Non-numeric input:');
  roundTo('abc', 2);
} catch (error) {
  console.warn('  ⚠️ Caught Expected Error:', error.message);
}
console.groupEnd();

console.groupEnd(); // End Number Utilities

console.log(
  '%c✅ All Utility Suites & Edge Case Checks Executed Successfully!',
  'background: #16a34a; color: #ffffff; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px; margin-top: 10px;'
);
