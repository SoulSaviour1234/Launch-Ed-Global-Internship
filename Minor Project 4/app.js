/**
 * ==============================================================================
 * HabitPulse — Core Application Engine
 * ==============================================================================
 * 
 * Architecture & Module Overview:
 * 1. StorageManager: Handles localStorage schema validation, sync & seed data.
 * 2. DateUtils: Date normalization (YYYY-MM-DD), ranges, and formatting helpers.
 * 3. StreakCalculator: Consecutive day streak calculation & historical analytics.
 * 4. ValidationEngine: Form validation rules, error dispatching & UI feedback.
 * 5. StateStore: Central reactive state container with publish-subscribe pattern.
 * 6. DOMRenderer: Secure, sanitized dynamic DOM manipulation and render cycles.
 * 7. ToastManager: Non-intrusive floating toast notifications.
 * 8. AppController: Event delegation, keyboard handlers, modal controllers & init.
 * 
 * Strict Vanilla JavaScript (ES6+) — Zero external runtime dependencies.
 * ==============================================================================
 */

'use strict';

/* ==============================================================================
   1. STORAGE MANAGER (Data Persistence & Schema Migration)
   ============================================================================== */
/**
 * StorageManager is responsible for reading from and writing to the browser's
 * localStorage API. It handles JSON serialization/deserialization, catches quota
 * exceeded errors, and injects starter habits for first-time visitors.
 */
const StorageManager = {
  STORAGE_KEY_HABITS: 'habitpulse_habits_v1',
  STORAGE_KEY_THEME: 'habitpulse_theme_v1',

  /**
   * Starter demo habits seeded on first load to immediately display a functional UI.
   */
  SEED_HABITS: [
    {
      id: 'habit_seed_1',
      title: 'Morning 20-Min Jog',
      category: 'Health',
      frequency: 'daily',
      emoji: '🏃',
      color: '#10b981',
      notes: 'Build stamina and boost morning energy before opening laptop.',
      createdAt: '2026-08-01',
      history: {} // Populated dynamically in initSeedHistory
    },
    {
      id: 'habit_seed_2',
      title: 'Deep Work Session (90m)',
      category: 'Work',
      frequency: 'weekdays',
      emoji: '💻',
      color: '#3b82f6',
      notes: 'Zero-distraction coding block with phone in another room.',
      createdAt: '2026-08-05',
      history: {}
    },
    {
      id: 'habit_seed_3',
      title: 'Read 20 Pages of a Book',
      category: 'Personal',
      frequency: 'daily',
      emoji: '📚',
      color: '#ec4899',
      notes: 'Continuous learning on software design and architecture.',
      createdAt: '2026-08-08',
      history: {}
    },
    {
      id: 'habit_seed_4',
      title: 'Mindful Meditation',
      category: 'Mindfulness',
      frequency: 'daily',
      emoji: '🧘',
      color: '#8b5cf6',
      notes: 'Evening calm-down session to reflect on daily progress.',
      createdAt: '2026-08-10',
      history: {}
    }
  ],

  /**
   * Initializes realistic completion history for seed habits based on today's date.
   */
  getInitialSeedData() {
    const today = DateUtils.getTodayString();
    const pastDays = DateUtils.getPastNDays(14); // Last 14 days

    return this.SEED_HABITS.map((habit, index) => {
      const history = {};
      // Seed consecutive days for realistic streak visualization
      if (index === 0) {
        // 5-day active streak (including today)
        pastDays.slice(0, 5).forEach(d => { history[d] = true; });
      } else if (index === 1) {
        // 3-day active streak
        pastDays.slice(0, 3).forEach(d => { history[d] = true; });
      } else if (index === 2) {
        // Yesterday completed, today pending (2-day streak pending extension)
        pastDays.slice(1, 4).forEach(d => { history[d] = true; });
      } else {
        // Occasional completion
        history[pastDays[1]] = true;
        history[pastDays[3]] = true;
      }
      return { ...habit, history };
    });
  },

  /**
   * Loads habits from localStorage or falls back to initial seed data.
   * @returns {Array<Object>} Array of habit objects
   */
  loadHabits() {
    try {
      const rawData = localStorage.getItem(this.STORAGE_KEY_HABITS);
      if (!rawData) {
        const seedData = this.getInitialSeedData();
        this.saveHabits(seedData);
        return seedData;
      }
      const parsed = JSON.parse(rawData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('[StorageManager] Failed to read from localStorage:', error);
      return this.getInitialSeedData();
    }
  },

  /**
   * Persists habits array to localStorage with error handling.
   * @param {Array<Object>} habits 
   * @returns {boolean} True if write succeeded
   */
  saveHabits(habits) {
    try {
      localStorage.setItem(this.STORAGE_KEY_HABITS, JSON.stringify(habits));
      return true;
    } catch (error) {
      console.error('[StorageManager] Failed to write to localStorage:', error);
      ToastManager.show('Failed to save data. LocalStorage quota may be full.', 'danger');
      return false;
    }
  },

  /**
   * Loads saved UI theme preference ('dark' or 'light').
   * @returns {string}
   */
  loadTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY_THEME) || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  /**
   * Saves UI theme preference to localStorage.
   * @param {string} theme ('dark' | 'light')
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.error('[StorageManager] Could not save theme:', e);
    }
  }
};


/* ==============================================================================
   2. DATE UTILITIES (Timezone-safe normalization & formatters)
   ============================================================================== */
/**
 * DateUtils provides date helper functions ensuring ISO date strings (YYYY-MM-DD)
 * are calculated in the user's local timezone to avoid off-by-one errors.
 */
const DateUtils = {
  /**
   * Returns a normalized 'YYYY-MM-DD' string for a given Date object (default: now).
   * @param {Date} [dateObj=new Date()]
   * @returns {string}
   */
  getTodayString(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Generates an array of normalized date strings for the past N days (starting from today).
   * @param {number} n Number of days
   * @returns {Array<string>} [today, yesterday, 2 days ago, ...]
   */
  getPastNDays(n = 7) {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dates.push(this.getTodayString(d));
    }
    return dates;
  },

  /**
   * Generates past N days ordered chronologically from oldest to newest.
   * Useful for calendar strips and heatmaps.
   * @param {number} n Number of days
   * @returns {Array<string>} [oldest ... today]
   */
  getPastNDaysAscending(n = 7) {
    return this.getPastNDays(n).reverse();
  },

  /**
   * Formats a 'YYYY-MM-DD' string into a short day label (e.g. 'Mon', 'Tue').
   * @param {string} dateStr 
   * @returns {string}
   */
  getDayLabel(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  },

  /**
   * Returns the day of month (e.g. '17').
   * @param {string} dateStr 
   * @returns {number}
   */
  getDayNumber(dateStr) {
    const [, , day] = dateStr.split('-').map(Number);
    return day;
  },

  /**
   * Formats current date for the main app header (e.g. "Monday, August 17, 2026").
   * @returns {string}
   */
  getFormattedHeaderDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};


/* ==============================================================================
   3. STREAK CALCULATOR ENGINE (Streak Analytics & Algorithm)
   ============================================================================== */
/**
 * StreakCalculator implements the core business logic for computing consecutive
 * day streaks, all-time best streaks, and completion percentages.
 * 
 * Streak Rules:
 * 1. Current Streak: A streak is active if today is completed OR if yesterday was
 *    completed (giving the user until the end of today to keep their streak alive).
 * 2. Consecutive Day Algorithm: Counts backwards day-by-day from the active anchor
 *    (today or yesterday) as long as history[date] is true.
 * 3. Longest Streak: Scans the entire sorted history to determine the longest continuous run.
 */
const StreakCalculator = {
  /**
   * Calculates comprehensive streak statistics for a single habit.
   * @param {Object} habit 
   * @returns {{ currentStreak: number, longestStreak: number, totalCompleted: number, isCompletedToday: boolean }}
   */
  calculate(habit) {
    const history = habit.history || {};
    const today = DateUtils.getTodayString();
    
    // Calculate yesterday's date string
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = DateUtils.getTodayString(yesterdayDate);

    const isCompletedToday = Boolean(history[today]);
    const isCompletedYesterday = Boolean(history[yesterday]);

    // Total lifetime completions
    const completedDates = Object.keys(history).filter(date => Boolean(history[date]));
    const totalCompleted = completedDates.length;

    // 1. Calculate Current Streak
    let currentStreak = 0;
    let anchorDate = null;

    if (isCompletedToday) {
      anchorDate = new Date();
    } else if (isCompletedYesterday) {
      // User hasn't checked in today yet, but streak is still intact from yesterday
      anchorDate = new Date(yesterdayDate);
    }

    if (anchorDate) {
      const checkCursor = new Date(anchorDate);
      while (true) {
        const dateStr = DateUtils.getTodayString(checkCursor);
        if (history[dateStr]) {
          currentStreak++;
          checkCursor.setDate(checkCursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 2. Calculate All-time Longest Streak
    let longestStreak = 0;
    if (completedDates.length > 0) {
      // Sort dates ascending
      const sortedDates = completedDates.sort();
      let tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        
        // Difference in calendar days
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    // Edge case: current streak can exceed previous recorded longest
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return {
      currentStreak,
      longestStreak,
      totalCompleted,
      isCompletedToday
    };
  },

  /**
   * Calculates overall daily completion statistics across all habits.
   * @param {Array<Object>} habits 
   * @returns {{ total: number, completed: number, percentage: number, maxStreak: number, totalCheckins: number }}
   */
  calculateGlobalStats(habits) {
    if (!habits || habits.length === 0) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        maxStreak: 0,
        totalCheckins: 0
      };
    }

    let completedTodayCount = 0;
    let maxStreak = 0;
    let totalCheckins = 0;

    habits.forEach(habit => {
      const stats = this.calculate(habit);
      if (stats.isCompletedToday) completedTodayCount++;
      if (stats.longestStreak > maxStreak) maxStreak = stats.longestStreak;
      totalCheckins += stats.totalCompleted;
    });

    const percentage = habits.length > 0
      ? Math.round((completedTodayCount / habits.length) * 100)
      : 0;

    return {
      total: habits.length,
      completed: completedTodayCount,
      percentage,
      maxStreak,
      totalCheckins
    };
  },

  /**
   * Computes the 30-day completion percentage for a single habit.
   * @param {Object} habit 
   * @returns {number}
   */
  calculate30DayRate(habit) {
    const past30 = DateUtils.getPastNDays(30);
    const history = habit.history || {};
    const completedCount = past30.filter(d => Boolean(history[d])).length;
    return Math.round((completedCount / 30) * 100);
  }
};


/* ==============================================================================
   4. FORM VALIDATION ENGINE
   ============================================================================== */
/**
 * ValidationEngine handles client-side input validation with descriptive
 * inline errors and accessibility indicators before DOM updates.
 */
const ValidationEngine = {
  /**
   * Validates habit form data.
   * @param {Object} formData { title, category, frequency, emoji, color }
   * @returns {{ isValid: boolean, errors: Object }}
   */
  validate(formData) {
    const errors = {};

    // 1. Validate Title
    const title = (formData.title || '').trim();
    if (!title) {
      errors.title = 'Habit name is required.';
    } else if (title.length < 3) {
      errors.title = 'Habit name must be at least 3 characters long.';
    } else if (title.length > 60) {
      errors.title = 'Habit name cannot exceed 60 characters.';
    }

    // 2. Validate Category
    const allowedCategories = ['Health', 'Work', 'Personal', 'Mindfulness', 'Fitness'];
    if (!formData.category) {
      errors.category = 'Please select a category.';
    } else if (!allowedCategories.includes(formData.category)) {
      errors.category = 'Invalid category selected.';
    }

    // 3. Validate Frequency
    const allowedFrequencies = ['daily', '5-days', '3-days', 'weekdays', 'weekends'];
    if (formData.frequency && !allowedFrequencies.includes(formData.frequency)) {
      errors.frequency = 'Invalid frequency option.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Clears all validation error classes and messages from the form.
   * @param {HTMLFormElement} formElement 
   */
  clearErrors(formElement) {
    const groups = formElement.querySelectorAll('.form-group');
    groups.forEach(group => {
      group.classList.remove('has-error');
      const errorMsg = group.querySelector('.form-error-msg');
      if (errorMsg) errorMsg.textContent = '';
    });
  },

  /**
   * Displays validation error messages under corresponding form fields.
   * @param {HTMLFormElement} formElement 
   * @param {Object} errors Map of fieldName -> errorMessage
   */
  displayErrors(formElement, errors) {
    this.clearErrors(formElement);
    Object.entries(errors).forEach(([field, message]) => {
      const group = formElement.querySelector(`#group-${field}`);
      const errorEl = formElement.querySelector(`#error-${field}`);
      if (group && errorEl) {
        group.classList.add('has-error');
        errorEl.textContent = message;
      }
    });
  }
};


/* ==============================================================================
   5. CENTRALIZED STATE STORE (Reactive State Pattern)
   ============================================================================== */
/**
 * StateStore holds the single source of truth for the application.
 * Changes to state automatically trigger persistent localStorage updates
 * and notify subscribed listeners to re-render the view.
 */
class StateStore {
  constructor() {
    this.state = {
      habits: StorageManager.loadHabits(),
      theme: StorageManager.loadTheme(),
      filters: {
        category: 'all',  // 'all' | 'Health' | 'Work' | 'Personal' | 'Mindfulness' | 'Fitness'
        status: 'all',    // 'all' | 'pending' | 'completed'
        search: ''        // Search term string
      },
      sort: 'created-desc', // 'created-desc' | 'streak-desc' | 'name-asc' | 'progress-desc'
      activeModalHabitId: null // ID of habit currently opened in details modal
    };

    this.listeners = [];
  }

  /**
   * Subscribes a listener callback to state changes.
   * @param {Function} listener 
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * Notifies all subscribers of state mutation.
   */
  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  /**
   * Returns a copy of the current state.
   */
  getState() {
    return this.state;
  }

  /**
   * Adds a new habit to state and persists to storage.
   * @param {Object} newHabitData 
   */
  addHabit(newHabitData) {
    const habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: newHabitData.title.trim(),
      category: newHabitData.category,
      frequency: newHabitData.frequency || 'daily',
      emoji: newHabitData.emoji || '⚡',
      color: newHabitData.color || '#6366f1',
      notes: (newHabitData.notes || '').trim(),
      createdAt: DateUtils.getTodayString(),
      history: {}
    };

    this.state.habits = [habit, ...this.state.habits];
    StorageManager.saveHabits(this.state.habits);
    this.notify();
    ToastManager.show(`Created habit "${habit.title}"! 🎉`, 'success');
  }

  /**
   * Updates an existing habit.
   * @param {string} habitId 
   * @param {Object} updatedFields 
   */
  updateHabit(habitId, updatedFields) {
    this.state.habits = this.state.habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          title: updatedFields.title.trim(),
          category: updatedFields.category,
          frequency: updatedFields.frequency,
          emoji: updatedFields.emoji,
          color: updatedFields.color,
          notes: (updatedFields.notes || '').trim()
        };
      }
      return h;
    });

    StorageManager.saveHabits(this.state.habits);
    this.notify();
    ToastManager.show('Habit updated successfully!', 'success');
  }

  /**
   * Deletes a habit by ID.
   * @param {string} habitId 
   */
  deleteHabit(habitId) {
    const habit = this.state.habits.find(h => h.id === habitId);
    const title = habit ? habit.title : 'Habit';
    this.state.habits = this.state.habits.filter(h => h.id !== habitId);
    StorageManager.saveHabits(this.state.habits);
    this.notify();
    ToastManager.show(`Deleted "${title}"`, 'danger');
  }

  /**
   * Toggles completion for a specific habit on a given date.
   * @param {string} habitId 
   * @param {string} dateStr 'YYYY-MM-DD'
   */
  toggleHabitDate(habitId, dateStr) {
    let nowCompleted = false;

    this.state.habits = this.state.habits.map(habit => {
      if (habit.id === habitId) {
        const history = { ...(habit.history || {}) };
        if (history[dateStr]) {
          delete history[dateStr];
          nowCompleted = false;
        } else {
          history[dateStr] = true;
          nowCompleted = true;
        }
        return { ...habit, history };
      }
      return habit;
    });

    StorageManager.saveHabits(this.state.habits);
    this.notify();

    // Trigger snappy toast if toggled for today
    if (dateStr === DateUtils.getTodayString()) {
      const habit = this.state.habits.find(h => h.id === habitId);
      if (nowCompleted) {
        const stats = StreakCalculator.calculate(habit);
        ToastManager.show(
          `Completed "${habit.title}"! 🔥 Streak: ${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
          'success'
        );
      }
    }
  }

  /**
   * Sets the active category filter ('all' | 'Health' | etc.).
   * @param {string} category 
   */
  setCategoryFilter(category) {
    this.state.filters.category = category;
    this.notify();
  }

  /**
   * Sets the completion status filter ('all' | 'pending' | 'completed').
   * @param {string} status 
   */
  setStatusFilter(status) {
    this.state.filters.status = status;
    this.notify();
  }

  /**
   * Sets search keyword query.
   * @param {string} search 
   */
  setSearchQuery(search) {
    this.state.filters.search = search.trim().toLowerCase();
    this.notify();
  }

  /**
   * Sets sorting criterion.
   * @param {string} sortKey 
   */
  setSort(sortKey) {
    this.state.sort = sortKey;
    this.notify();
  }

  /**
   * Toggles theme between 'dark' and 'light'.
   */
  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    StorageManager.saveTheme(this.state.theme);
    this.notify();
  }

  /**
   * Returns habits filtered by active category, status, search, and sorted.
   * @returns {Array<Object>}
   */
  getFilteredHabits() {
    const { habits, filters, sort } = this.state;
    const today = DateUtils.getTodayString();

    return habits
      .filter(habit => {
        // 1. Category Filter
        if (filters.category !== 'all' && habit.category !== filters.category) {
          return false;
        }

        // 2. Status Filter
        const isDoneToday = Boolean(habit.history && habit.history[today]);
        if (filters.status === 'completed' && !isDoneToday) {
          return false;
        }
        if (filters.status === 'pending' && isDoneToday) {
          return false;
        }

        // 3. Search Filter
        if (filters.search) {
          const matchTitle = habit.title.toLowerCase().includes(filters.search);
          const matchCategory = habit.category.toLowerCase().includes(filters.search);
          const matchNotes = (habit.notes || '').toLowerCase().includes(filters.search);
          if (!matchTitle && !matchCategory && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // 4. Sorting
        if (sort === 'streak-desc') {
          const streakA = StreakCalculator.calculate(a).currentStreak;
          const streakB = StreakCalculator.calculate(b).currentStreak;
          return streakB - streakA;
        }
        if (sort === 'name-asc') {
          return a.title.localeCompare(b.title);
        }
        if (sort === 'progress-desc') {
          const doneA = a.history && a.history[today] ? 1 : 0;
          const doneB = b.history && b.history[today] ? 1 : 0;
          return doneB - doneA;
        }
        // Default: created-desc
        return (b.id || '').localeCompare(a.id || '');
      });
  }
}


/* ==============================================================================
   6. TOAST NOTIFICATION MANAGER
   ============================================================================== */
/**
 * ToastManager renders temporary non-blocking UI alert feedback.
 */
const ToastManager = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  /**
   * Displays a toast notification.
   * @param {string} message 
   * @param {'success' | 'danger' | 'info'} [type='success'] 
   * @param {number} [duration=3500] 
   */
  show(message, type = 'success', duration = 3500) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'danger' ? '⚠️' : type === 'info' ? 'ℹ️' : '✨';
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message"></span>
    `;
    toast.querySelector('.toast-message').textContent = message;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }
};


/* ==============================================================================
   7. DYNAMIC DOM RENDERER
   ============================================================================== */
/**
 * DOMRenderer securely builds and updates HTML elements based on current application state.
 * Implements strict sanitization to prevent Cross-Site Scripting (XSS).
 */
const DOMRenderer = {
  elements: {},

  /**
   * Caches static DOM elements.
   */
  init() {
    this.elements = {
      htmlRoot: document.documentElement,
      currentDateDisplay: document.getElementById('current-date-display'),
      dailyProgressCircle: document.getElementById('daily-progress-circle'),
      progressPercentageText: document.getElementById('progress-percentage-text'),
      greetingHeading: document.getElementById('greeting-heading'),
      progressStatusText: document.getElementById('progress-status-text'),
      dailyProgressBar: document.getElementById('daily-progress-bar'),
      longestStreakStat: document.getElementById('longest-streak-stat'),
      activeHabitsStat: document.getElementById('active-habits-stat'),
      totalCompletionsStat: document.getElementById('total-completions-stat'),
      habitsGrid: document.getElementById('habits-grid'),
      emptyState: document.getElementById('empty-state'),
      visibleHabitCount: document.getElementById('visible-habit-count'),
      categoryPills: document.querySelectorAll('.category-pill'),
      statusTabs: document.querySelectorAll('.status-tab'),
      searchInput: document.getElementById('search-input'),
      clearSearchBtn: document.getElementById('clear-search-btn'),
      sortSelect: document.getElementById('sort-select'),

      // Add/Edit Modal Elements
      habitModalOverlay: document.getElementById('habit-modal-overlay'),
      habitModalForm: document.getElementById('habit-form'),
      modalTitle: document.getElementById('modal-title'),
      modalIconBadge: document.getElementById('modal-icon-badge'),
      habitIdInput: document.getElementById('habit-id'),
      habitTitleInput: document.getElementById('habit-title'),
      habitCategorySelect: document.getElementById('habit-category'),
      habitFrequencySelect: document.getElementById('habit-frequency'),
      habitEmojiInput: document.getElementById('habit-emoji'),
      habitColorInput: document.getElementById('habit-color'),
      habitNotesInput: document.getElementById('habit-notes'),
      emojiPickerContainer: document.getElementById('emoji-picker-container'),
      colorPickerContainer: document.getElementById('color-picker-container'),

      // Details Modal Elements
      detailsModalOverlay: document.getElementById('details-modal-overlay'),
      detailsEmoji: document.getElementById('details-emoji'),
      detailsTitle: document.getElementById('details-title'),
      detailsCategoryMeta: document.getElementById('details-category-meta'),
      detailsCurrentStreak: document.getElementById('details-current-streak'),
      detailsBestStreak: document.getElementById('details-best-streak'),
      detailsTotalDays: document.getElementById('details-total-days'),
      detailsMonthRate: document.getElementById('details-month-rate'),
      detailsHeatmapGrid: document.getElementById('details-heatmap-grid'),
      detailsNotesBox: document.getElementById('details-notes-box'),
      detailsNotesText: document.getElementById('details-notes-text'),
      detailsDeleteBtn: document.getElementById('details-delete-btn'),
      detailsEditBtn: document.getElementById('details-edit-btn'),
      legendActiveBox: document.getElementById('legend-active-box')
    };

    // Update static header date
    if (this.elements.currentDateDisplay) {
      this.elements.currentDateDisplay.textContent = DateUtils.getFormattedHeaderDate();
    }
  },

  /**
   * Main render method called whenever state changes.
   * @param {Object} state 
   */
  render(state) {
    this.renderTheme(state.theme);
    this.renderStats(state.habits);
    this.renderControls(state.filters, state.sort);
    this.renderHabitsList(state);
  },

  /**
   * Synchronizes theme attribute on the <html> tag.
   * @param {string} theme 
   */
  renderTheme(theme) {
    this.elements.htmlRoot.setAttribute('data-theme', theme);
  },

  /**
   * Renders overall dashboard analytics (progress ring, linear bar, stat counts).
   * @param {Array<Object>} habits 
   */
  renderStats(habits) {
    const stats = StreakCalculator.calculateGlobalStats(habits);

    // 1. Circular Progress Ring (circumference: 2 * PI * 50 = ~314.159)
    const circumference = 314.159;
    const strokeOffset = circumference - (circumference * stats.percentage) / 100;
    
    if (this.elements.dailyProgressCircle) {
      this.elements.dailyProgressCircle.style.strokeDashoffset = strokeOffset;
    }
    if (this.elements.progressPercentageText) {
      this.elements.progressPercentageText.textContent = `${stats.percentage}%`;
    }

    // 2. Linear Progress Bar & Dynamic Greeting
    if (this.elements.dailyProgressBar) {
      this.elements.dailyProgressBar.style.width = `${stats.percentage}%`;
    }
    if (this.elements.progressStatusText) {
      this.elements.progressStatusText.textContent = 
        `You have completed ${stats.completed} of ${stats.total} ${stats.total === 1 ? 'habit' : 'habits'} today.`;
    }
    if (this.elements.greetingHeading) {
      if (stats.total === 0) {
        this.elements.greetingHeading.textContent = 'Welcome! Start by adding a habit.';
      } else if (stats.percentage === 100) {
        this.elements.greetingHeading.textContent = 'Awesome job! All habits completed today! 🌟';
      } else if (stats.percentage >= 50) {
        this.elements.greetingHeading.textContent = 'Great momentum! Over halfway done. 💪';
      } else {
        this.elements.greetingHeading.textContent = 'Keep the momentum going! 🔥';
      }
    }

    // 3. Quick Stats Cards
    if (this.elements.longestStreakStat) {
      this.elements.longestStreakStat.textContent = `${stats.maxStreak} ${stats.maxStreak === 1 ? 'day' : 'days'}`;
    }
    if (this.elements.activeHabitsStat) {
      this.elements.activeHabitsStat.textContent = stats.total;
    }
    if (this.elements.totalCompletionsStat) {
      this.elements.totalCompletionsStat.textContent = stats.totalCheckins;
    }
  },

  /**
   * Updates active state classes on category pills, status tabs, and sort select.
   * @param {Object} filters 
   * @param {string} sort 
   */
  renderControls(filters, sort) {
    // Category pills active state
    this.elements.categoryPills.forEach(pill => {
      const category = pill.getAttribute('data-category');
      pill.classList.toggle('active', category === filters.category);
    });

    // Status filter tabs active state
    this.elements.statusTabs.forEach(tab => {
      const status = tab.getAttribute('data-status');
      const isActive = status === filters.status;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Search clear button visibility
    if (this.elements.clearSearchBtn) {
      this.elements.clearSearchBtn.classList.toggle('hidden', !filters.search);
    }

    // Sort select value
    if (this.elements.sortSelect && this.elements.sortSelect.value !== sort) {
      this.elements.sortSelect.value = sort;
    }
  },

  /**
   * Dynamically renders habit cards into the grid container.
   * @param {Object} state 
   */
  renderHabitsList(state) {
    const habits = stateStore.getFilteredHabits();
    const today = DateUtils.getTodayString();
    const past7DaysAsc = DateUtils.getPastNDaysAscending(7);

    // Update count badge
    if (this.elements.visibleHabitCount) {
      this.elements.visibleHabitCount.textContent = habits.length;
    }

    // Handle Empty State
    if (habits.length === 0) {
      this.elements.habitsGrid.innerHTML = '';
      this.elements.emptyState.classList.remove('hidden');
      return;
    }

    this.elements.emptyState.classList.add('hidden');

    // Build DOM elements for each habit
    const fragment = document.createDocumentFragment();

    habits.forEach(habit => {
      const stats = StreakCalculator.calculate(habit);
      const isDoneToday = stats.isCompletedToday;

      const card = document.createElement('article');
      card.className = `glass-card habit-card ${isDoneToday ? 'completed-today' : ''}`;
      card.style.setProperty('--card-accent', habit.color || '#6366f1');

      // Top Row: Emoji Icon + Title & Category + Action Buttons
      const cardTop = document.createElement('div');
      cardTop.className = 'habit-card-top';

      const headerMain = document.createElement('div');
      headerMain.className = 'habit-header-main';

      const emojiBadge = document.createElement('div');
      emojiBadge.className = 'habit-emoji-badge';
      emojiBadge.style.setProperty('--badge-bg', `${habit.color}20`);
      emojiBadge.style.setProperty('--badge-border', `${habit.color}40`);
      emojiBadge.textContent = habit.emoji || '⚡';

      const metaInfo = document.createElement('div');
      metaInfo.className = 'habit-meta-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'habit-title-row';

      const titleEl = document.createElement('h4');
      titleEl.className = 'habit-title';
      titleEl.textContent = habit.title;
      titleEl.title = 'View habit details';
      titleEl.setAttribute('data-action', 'open-details');
      titleEl.setAttribute('data-id', habit.id);

      titleRow.appendChild(titleEl);

      const tagsRow = document.createElement('div');
      tagsRow.className = 'habit-tags-row';

      const categoryTag = document.createElement('span');
      categoryTag.className = 'habit-category-tag';
      categoryTag.textContent = habit.category;

      const freqTag = document.createElement('span');
      freqTag.className = 'habit-freq-tag';
      freqTag.textContent = `• ${this.formatFrequency(habit.frequency)}`;

      tagsRow.appendChild(categoryTag);
      tagsRow.appendChild(freqTag);

      metaInfo.appendChild(titleRow);
      metaInfo.appendChild(tagsRow);

      headerMain.appendChild(emojiBadge);
      headerMain.appendChild(metaInfo);

      // Card Header Actions (Edit / Delete / Details)
      const actionsMenu = document.createElement('div');
      actionsMenu.className = 'card-actions-menu';

      // Details / Analytics Button
      const detailsBtn = document.createElement('button');
      detailsBtn.className = 'card-action-btn';
      detailsBtn.title = 'View Details & History';
      detailsBtn.setAttribute('data-action', 'open-details');
      detailsBtn.setAttribute('data-id', habit.id);
      detailsBtn.setAttribute('aria-label', `View details for ${habit.title}`);
      detailsBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      `;

      // Edit Button
      const editBtn = document.createElement('button');
      editBtn.className = 'card-action-btn';
      editBtn.title = 'Edit Habit';
      editBtn.setAttribute('data-action', 'edit-habit');
      editBtn.setAttribute('data-id', habit.id);
      editBtn.setAttribute('aria-label', `Edit ${habit.title}`);
      editBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      `;

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'card-action-btn delete-btn';
      deleteBtn.title = 'Delete Habit';
      deleteBtn.setAttribute('data-action', 'delete-habit');
      deleteBtn.setAttribute('data-id', habit.id);
      deleteBtn.setAttribute('aria-label', `Delete ${habit.title}`);
      deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;

      actionsMenu.appendChild(detailsBtn);
      actionsMenu.appendChild(editBtn);
      actionsMenu.appendChild(deleteBtn);

      cardTop.appendChild(headerMain);
      cardTop.appendChild(actionsMenu);

      // Middle Row: Streak Counter and Best Streak
      const statsRow = document.createElement('div');
      statsRow.className = 'habit-card-stats';

      const streakIndicator = document.createElement('div');
      streakIndicator.className = 'streak-indicator';
      
      const fireSpan = document.createElement('span');
      fireSpan.className = `streak-icon ${stats.currentStreak > 0 ? 'streak-fire-active' : ''}`;
      fireSpan.textContent = stats.currentStreak > 0 ? '🔥' : '⚡';

      const streakText = document.createElement('span');
      streakText.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'} streak`;

      streakIndicator.appendChild(fireSpan);
      streakIndicator.appendChild(streakText);

      const bestStreakText = document.createElement('span');
      bestStreakText.className = 'best-streak-text';
      bestStreakText.textContent = `Best: ${stats.longestStreak}d`;

      statsRow.appendChild(streakIndicator);
      statsRow.appendChild(bestStreakText);

      // 7-Day Past History Mini Strip
      const weekStrip = document.createElement('div');
      weekStrip.className = 'week-tracker-strip';

      past7DaysAsc.forEach(dateStr => {
        const isCompletedOnDate = Boolean(habit.history && habit.history[dateStr]);
        const isCurrentDay = dateStr === today;
        const dayLabelText = DateUtils.getDayLabel(dateStr);
        const dayNum = DateUtils.getDayNumber(dateStr);

        const slot = document.createElement('div');
        slot.className = 'week-day-slot';

        const label = document.createElement('span');
        label.className = 'day-label';
        label.textContent = dayLabelText.charAt(0); // 'M', 'T', 'W'...

        const bubbleBtn = document.createElement('button');
        bubbleBtn.type = 'button';
        bubbleBtn.className = `day-bubble-btn ${isCompletedOnDate ? 'completed' : ''} ${isCurrentDay ? 'is-today' : ''}`;
        bubbleBtn.setAttribute('data-action', 'toggle-date');
        bubbleBtn.setAttribute('data-id', habit.id);
        bubbleBtn.setAttribute('data-date', dateStr);
        bubbleBtn.setAttribute('title', `${dateStr}: ${isCompletedOnDate ? 'Completed' : 'Pending'}`);
        bubbleBtn.setAttribute('aria-label', `Toggle completion for ${habit.title} on ${dateStr}`);
        
        // Show checkmark icon if done, otherwise day number
        if (isCompletedOnDate) {
          bubbleBtn.innerHTML = `✓`;
        } else {
          bubbleBtn.textContent = dayNum;
        }

        slot.appendChild(label);
        slot.appendChild(bubbleBtn);
        weekStrip.appendChild(slot);
      });

      // Bottom Row: Full Width Quick Complete Button for Today
      const footerRow = document.createElement('div');
      footerRow.className = 'habit-card-footer';

      const completeBtn = document.createElement('button');
      completeBtn.type = 'button';
      completeBtn.className = `complete-toggle-btn ${isDoneToday ? 'is-done' : ''}`;
      completeBtn.setAttribute('data-action', 'toggle-date');
      completeBtn.setAttribute('data-id', habit.id);
      completeBtn.setAttribute('data-date', today);
      completeBtn.setAttribute('aria-label', `Mark ${habit.title} as ${isDoneToday ? 'incomplete' : 'complete'} for today`);

      if (isDoneToday) {
        completeBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Completed Today</span>
        `;
      } else {
        completeBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <span>Mark Complete Today</span>
        `;
      }

      footerRow.appendChild(completeBtn);

      // Assemble card
      card.appendChild(cardTop);
      card.appendChild(statsRow);
      card.appendChild(weekStrip);
      card.appendChild(footerRow);

      fragment.appendChild(card);
    });

    this.elements.habitsGrid.innerHTML = '';
    this.elements.habitsGrid.appendChild(fragment);
  },

  /**
   * Helper to format frequency select keys to human-readable strings.
   * @param {string} freqKey 
   * @returns {string}
   */
  formatFrequency(freqKey) {
    switch (freqKey) {
      case '5-days': return '5 days/week';
      case '3-days': return '3 days/week';
      case 'weekdays': return 'Weekdays';
      case 'weekends': return 'Weekends';
      case 'daily':
      default:
        return 'Daily';
    }
  },

  /**
   * Renders the deep analytics 30-day heatmap inside the Details Modal.
   * @param {Object} habit 
   */
  renderDetailsModal(habit) {
    if (!habit) return;

    const stats = StreakCalculator.calculate(habit);
    const monthRate = StreakCalculator.calculate30DayRate(habit);
    const past30DaysAsc = DateUtils.getPastNDaysAscending(30);
    const today = DateUtils.getTodayString();

    // Populate header & metadata
    this.elements.detailsEmoji.textContent = habit.emoji || '⚡';
    this.elements.detailsTitle.textContent = habit.title;
    this.elements.detailsCategoryMeta.textContent = `${habit.category} • Target: ${this.formatFrequency(habit.frequency)} • Created ${habit.createdAt || 'recently'}`;

    // Populate stats
    this.elements.detailsCurrentStreak.textContent = `${stats.currentStreak} 🔥`;
    this.elements.detailsBestStreak.textContent = `${stats.longestStreak} 🏆`;
    this.elements.detailsTotalDays.textContent = `${stats.totalCompleted} days`;
    this.elements.detailsMonthRate.textContent = `${monthRate}%`;

    // Update legend accent
    if (this.elements.legendActiveBox) {
      this.elements.legendActiveBox.style.backgroundColor = habit.color || 'var(--primary)';
    }

    // Populate 30-day activity heatmap grid
    this.elements.detailsHeatmapGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    past30DaysAsc.forEach(dateStr => {
      const isDone = Boolean(habit.history && habit.history[dateStr]);
      const isCurrent = dateStr === today;

      const cell = document.createElement('div');
      cell.className = `heatmap-cell ${isDone ? 'completed' : ''} ${isCurrent ? 'is-today' : ''}`;
      if (isDone) {
        cell.style.backgroundColor = habit.color || 'var(--primary)';
        cell.style.borderColor = habit.color || 'var(--primary)';
      }
      cell.title = `${dateStr}: ${isDone ? 'Completed' : 'Missed'}`;
      
      // Allow clicking heatmap cell to toggle completion directly from details view!
      cell.addEventListener('click', () => {
        stateStore.toggleHabitDate(habit.id, dateStr);
        // Re-render modal with updated stats
        const updatedHabit = stateStore.getState().habits.find(h => h.id === habit.id);
        if (updatedHabit) {
          DOMRenderer.renderDetailsModal(updatedHabit);
        }
      });

      fragment.appendChild(cell);
    });

    this.elements.detailsHeatmapGrid.appendChild(fragment);

    // Notes / Motivation Box
    if (habit.notes && habit.notes.trim()) {
      this.elements.detailsNotesBox.classList.remove('hidden');
      this.elements.detailsNotesText.textContent = habit.notes;
    } else {
      this.elements.detailsNotesBox.classList.add('hidden');
    }

    // Action button handlers
    this.elements.detailsDeleteBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete "${habit.title}"?`)) {
        stateStore.deleteHabit(habit.id);
        this.closeDetailsModal();
      }
    };

    this.elements.detailsEditBtn.onclick = () => {
      this.closeDetailsModal();
      this.openHabitModal(habit);
    };

    // Show modal
    this.elements.detailsModalOverlay.classList.remove('hidden');
  },

  /**
   * Opens the Add/Edit Habit Modal and populates values if editing.
   * @param {Object} [habitToEdit=null]
   */
  openHabitModal(habitToEdit = null) {
    ValidationEngine.clearErrors(this.elements.habitModalForm);

    if (habitToEdit) {
      // Edit Mode
      this.elements.modalTitle.textContent = 'Edit Habit';
      this.elements.modalIconBadge.textContent = '✏️';
      this.elements.habitIdInput.value = habitToEdit.id;
      this.elements.habitTitleInput.value = habitToEdit.title;
      this.elements.habitCategorySelect.value = habitToEdit.category;
      this.elements.habitFrequencySelect.value = habitToEdit.frequency || 'daily';
      this.elements.habitEmojiInput.value = habitToEdit.emoji || '⚡';
      this.elements.habitColorInput.value = habitToEdit.color || '#6366f1';
      this.elements.habitNotesInput.value = habitToEdit.notes || '';
    } else {
      // Create Mode
      this.elements.modalTitle.textContent = 'Add New Habit';
      this.elements.modalIconBadge.textContent = '⚡';
      this.elements.habitModalForm.reset();
      this.elements.habitIdInput.value = '';
      this.elements.habitEmojiInput.value = '⚡';
      this.elements.habitColorInput.value = '#6366f1';
    }

    // Synchronize selected emoji picker buttons
    const activeEmoji = this.elements.habitEmojiInput.value;
    const emojiBtns = this.elements.emojiPickerContainer.querySelectorAll('.emoji-opt-btn');
    emojiBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-emoji') === activeEmoji);
    });

    // Synchronize selected color picker buttons
    const activeColor = this.elements.habitColorInput.value;
    const colorBtns = this.elements.colorPickerContainer.querySelectorAll('.color-opt-btn');
    colorBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-color') === activeColor);
    });

    this.elements.habitModalOverlay.classList.remove('hidden');
    this.elements.habitTitleInput.focus();
  },

  closeHabitModal() {
    this.elements.habitModalOverlay.classList.add('hidden');
    ValidationEngine.clearErrors(this.elements.habitModalForm);
  },

  closeDetailsModal() {
    this.elements.detailsModalOverlay.classList.add('hidden');
  }
};


/* ==============================================================================
   8. APPLICATION CONTROLLER (Event Listeners & Orchestration)
   ============================================================================== */
// Initialize State Store
const stateStore = new StateStore();

const AppController = {
  /**
   * Initializes application lifecycle, registers event listeners, and runs initial render.
   */
  init() {
    // 1. Initialize DOM Renderer & Toast system
    DOMRenderer.init();
    ToastManager.init();

    // 2. Subscribe DOMRenderer to state mutations
    stateStore.subscribe(state => DOMRenderer.render(state));

    // 3. Register DOM Event Listeners
    this.bindEvents();

    // 4. Run initial render
    DOMRenderer.render(stateStore.getState());
  },

  /**
   * Binds UI events using event delegation for performance and clean memory management.
   */
  bindEvents() {
    // Theme Switcher Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => stateStore.toggleTheme());
    }

    // Open Add Modal Buttons
    const openAddBtn = document.getElementById('open-add-modal-btn');
    if (openAddBtn) {
      openAddBtn.addEventListener('click', () => DOMRenderer.openHabitModal());
    }

    const emptyCreateBtn = document.getElementById('empty-create-btn');
    if (emptyCreateBtn) {
      emptyCreateBtn.addEventListener('click', () => DOMRenderer.openHabitModal());
    }

    // Modal Close Buttons
    const closeHabitModalBtn = document.getElementById('close-habit-modal-btn');
    if (closeHabitModalBtn) {
      closeHabitModalBtn.addEventListener('click', () => DOMRenderer.closeHabitModal());
    }

    const cancelHabitBtn = document.getElementById('cancel-habit-btn');
    if (cancelHabitBtn) {
      cancelHabitBtn.addEventListener('click', () => DOMRenderer.closeHabitModal());
    }

    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    if (closeDetailsModalBtn) {
      closeDetailsModalBtn.addEventListener('click', () => DOMRenderer.closeDetailsModal());
    }

    // Close Modals on Overlay Backdrop Click
    const habitModalOverlay = document.getElementById('habit-modal-overlay');
    if (habitModalOverlay) {
      habitModalOverlay.addEventListener('click', e => {
        if (e.target === habitModalOverlay) DOMRenderer.closeHabitModal();
      });
    }

    const detailsModalOverlay = document.getElementById('details-modal-overlay');
    if (detailsModalOverlay) {
      detailsModalOverlay.addEventListener('click', e => {
        if (e.target === detailsModalOverlay) DOMRenderer.closeDetailsModal();
      });
    }

    // Keyboard Navigation: Escape key closes active modal
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        DOMRenderer.closeHabitModal();
        DOMRenderer.closeDetailsModal();
      }
    });

    // Habit Form Submission with Input Validation
    const habitForm = document.getElementById('habit-form');
    if (habitForm) {
      habitForm.addEventListener('submit', e => {
        e.preventDefault();

        const formData = {
          habitId: document.getElementById('habit-id').value,
          title: document.getElementById('habit-title').value,
          category: document.getElementById('habit-category').value,
          frequency: document.getElementById('habit-frequency').value,
          emoji: document.getElementById('habit-emoji').value,
          color: document.getElementById('habit-color').value,
          notes: document.getElementById('habit-notes').value
        };

        // Run validation rules
        const validation = ValidationEngine.validate(formData);

        if (!validation.isValid) {
          ValidationEngine.displayErrors(habitForm, validation.errors);
          return;
        }

        // Save habit (Create or Update)
        if (formData.habitId) {
          stateStore.updateHabit(formData.habitId, formData);
        } else {
          stateStore.addHabit(formData);
        }

        DOMRenderer.closeHabitModal();
      });

      // Live validation clearing on input
      const titleInput = document.getElementById('habit-title');
      if (titleInput) {
        titleInput.addEventListener('input', () => {
          if (titleInput.value.trim().length >= 3) {
            document.getElementById('group-title')?.classList.remove('has-error');
          }
        });
      }

      const categorySelect = document.getElementById('habit-category');
      if (categorySelect) {
        categorySelect.addEventListener('change', () => {
          if (categorySelect.value) {
            document.getElementById('group-category')?.classList.remove('has-error');
          }
        });
      }
    }

    // Emoji Picker Click Handler
    const emojiPicker = document.getElementById('emoji-picker-container');
    if (emojiPicker) {
      emojiPicker.addEventListener('click', e => {
        const btn = e.target.closest('.emoji-opt-btn');
        if (!btn) return;
        const emoji = btn.getAttribute('data-emoji');
        document.getElementById('habit-emoji').value = emoji;

        emojiPicker.querySelectorAll('.emoji-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    }

    // Color Picker Click Handler
    const colorPicker = document.getElementById('color-picker-container');
    if (colorPicker) {
      colorPicker.addEventListener('click', e => {
        const btn = e.target.closest('.color-opt-btn');
        if (!btn) return;
        const color = btn.getAttribute('data-color');
        document.getElementById('habit-color').value = color;

        colorPicker.querySelectorAll('.color-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    }

    // Category Filter Pills Delegation
    const categoryList = document.getElementById('category-pills-list');
    if (categoryList) {
      categoryList.addEventListener('click', e => {
        const pill = e.target.closest('.category-pill');
        if (!pill) return;
        const category = pill.getAttribute('data-category');
        stateStore.setCategoryFilter(category);
      });
    }

    // Status Filter Tabs Delegation
    const statusTabsContainer = document.querySelector('.status-filters');
    if (statusTabsContainer) {
      statusTabsContainer.addEventListener('click', e => {
        const tab = e.target.closest('.status-tab');
        if (!tab) return;
        const status = tab.getAttribute('data-status');
        stateStore.setStatusFilter(status);
      });
    }

    // Search Input with Debounce / Live Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        stateStore.setSearchQuery(e.target.value);
      });
    }

    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        stateStore.setSearchQuery('');
        if (searchInput) searchInput.focus();
      });
    }

    // Sort Selector Change
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        stateStore.setSort(e.target.value);
      });
    }

    // Habits Grid Event Delegation (Completing dates, editing, deleting, viewing details)
    const habitsGrid = document.getElementById('habits-grid');
    if (habitsGrid) {
      habitsGrid.addEventListener('click', e => {
        const trigger = e.target.closest('[data-action]');
        if (!trigger) return;

        const action = trigger.getAttribute('data-action');
        const habitId = trigger.getAttribute('data-id');

        if (action === 'toggle-date') {
          const dateStr = trigger.getAttribute('data-date');
          if (habitId && dateStr) {
            stateStore.toggleHabitDate(habitId, dateStr);
          }
        } else if (action === 'open-details') {
          const habit = stateStore.getState().habits.find(h => h.id === habitId);
          if (habit) {
            DOMRenderer.renderDetailsModal(habit);
          }
        } else if (action === 'edit-habit') {
          const habit = stateStore.getState().habits.find(h => h.id === habitId);
          if (habit) {
            DOMRenderer.openHabitModal(habit);
          }
        } else if (action === 'delete-habit') {
          const habit = stateStore.getState().habits.find(h => h.id === habitId);
          if (habit && confirm(`Are you sure you want to delete "${habit.title}"?`)) {
            stateStore.deleteHabit(habitId);
          }
        }
      });
    }
  }
};

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});
