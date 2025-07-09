/**
 * Modern Pomodoro Timer - Clean & Centered
 * Focused on productivity without distractions
 */

class PomodoroTimer {
  constructor() {
    // Timer settings
    this.settings = {
      focusTime: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 20 * 60,
      sessionsBeforeLong: 4
    };

    // Timer state
    this.state = {
      currentSession: 0,
      isFocus: true,
      isRunning: false,
      remainingTime: this.settings.focusTime,
      timer: null,
      totalTime: this.settings.focusTime
    };

    // DOM elements
    this.elements = this.initializeElements();
    
    // Initialize the application
    this.init();
  }

  initializeElements() {
    return {
      // Theme control
      themeToggle: document.getElementById('themeToggle'),
      body: document.body,
      
      // Timer elements
      pomodoroTimer: document.getElementById('pomodoroTimer'),
      timerLabel: document.getElementById('timerLabel'),
      startStopBtn: document.getElementById('startStopBtn'),
      resetBtn: document.getElementById('resetBtn'),
      sessionCount: document.getElementById('sessionCount'),
      
      // Progress elements
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      
      // Settings form (now on main page)
      settingsForm: document.getElementById('settingsForm'),
      resetSettings: document.getElementById('resetSettings'),
      
      // App size control
      appSize: document.getElementById('appSize'),
      
      // Side panel elements
      sidePanel: document.querySelector('.side-panel'),
      sidePanelToggle: document.getElementById('sidePanelToggle'),
      todayFocus: document.getElementById('todayFocus'),
      totalTime: document.getElementById('totalTime'),
      streakCount: document.getElementById('streakCount'),
      weeklyAvg: document.getElementById('weeklyAvg'),
      sessionHistory: document.getElementById('sessionHistory'),
      quickFocus: document.getElementById('quickFocus'),
      quickBreak: document.getElementById('quickBreak'),
      clearStats: document.getElementById('clearStats'),
      
      // Navigation elements
      timerTab: document.getElementById('timerTab'),
      settingsTab: document.getElementById('settingsTab'),
      timerView: document.getElementById('timerView'),
      settingsView: document.getElementById('settingsView')
    };
  }

  init() {
    this.loadSettings();
    this.populateSettingsForm(); // Populate settings form on page load
    this.setupEventListeners();
    this.updateDisplay();
    this.updateSessionCount();
    this.updateProgressBar();
    this.loadThemePreference();
    this.loadAppSize();
    
    // Initialize statistics
    this.stats = {
      todayFocus: 0,
      totalTime: 0,
      streakCount: 0,
      weeklyAvg: 0,
      sessions: []
    };
    
    this.loadStats();
    this.setupSidePanel();
    
    console.log('🍅 Pomodoro Timer initialized!');
  }

  setupEventListeners() {
    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Navigation between timer and settings
    if (this.elements.timerTab) {
      this.elements.timerTab.addEventListener('click', () => {
        this.switchToTimerView();
      });
    }

    if (this.elements.settingsTab) {
      this.elements.settingsTab.addEventListener('click', () => {
        this.switchToSettingsView();
      });
    }

    // Settings form (now on main page)
    this.elements.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Reset settings
    if (this.elements.resetSettings) {
      this.elements.resetSettings.addEventListener('click', () => {
        this.resetToDefaultSettings();
      });
    }

    // App size control
    if (this.elements.appSize) {
      this.elements.appSize.addEventListener('input', (e) => {
        this.updateAppSize(e.target.value);
      });
    }

    // Timer controls
    this.elements.startStopBtn.addEventListener('click', () => {
      this.startStopTimer();
    });

    this.elements.resetBtn.addEventListener('click', () => {
      this.resetTimer();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Page visibility for background timer
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }

  // App Size Management
  updateAppSize(size) {
    const appSize = Math.max(200, Math.min(600, parseInt(size)));
    document.documentElement.style.setProperty('--app-size', `${appSize}px`);
    
    // Update the input field if it exists
    if (this.elements.appSize) {
      this.elements.appSize.value = appSize;
    }
  }

  loadAppSize() {
    const savedSize = localStorage.getItem('pomodoroAppSize');
    if (savedSize) {
      this.updateAppSize(parseInt(savedSize));
    }
  }

  // Navigation Management
  switchToTimerView() {
    // Update view visibility
    if (this.elements.timerView) {
      this.elements.timerView.classList.add('active');
    }
    if (this.elements.settingsView) {
      this.elements.settingsView.classList.remove('active');
    }
    
    // Update navigation buttons
    if (this.elements.timerTab) {
      this.elements.timerTab.classList.add('active');
    }
    if (this.elements.settingsTab) {
      this.elements.settingsTab.classList.remove('active');
    }
  }

  switchToSettingsView() {
    // Update view visibility
    if (this.elements.timerView) {
      this.elements.timerView.classList.remove('active');
    }
    if (this.elements.settingsView) {
      this.elements.settingsView.classList.add('active');
    }
    
    // Update navigation buttons
    if (this.elements.timerTab) {
      this.elements.timerTab.classList.remove('active');
    }
    if (this.elements.settingsTab) {
      this.elements.settingsTab.classList.add('active');
    }
  }

  // Theme Management
  toggleTheme() {
    this.elements.body.classList.toggle('dark');
    const isDark = this.elements.body.classList.contains('dark');
    
    localStorage.setItem('pomodoroTheme', isDark ? 'dark' : 'light');
    this.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Animate button
    this.elements.themeToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.elements.themeToggle.style.transform = 'scale(1)';
    }, 150);
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('pomodoroTheme');
    if (savedTheme === 'dark') {
      this.elements.body.classList.add('dark');
      this.elements.themeToggle.textContent = '☀️';
    } else {
      this.elements.themeToggle.textContent = '🌙';
    }
  }

  // Timer Functions
  updateDisplay() {
    const minutes = Math.floor(this.state.remainingTime / 60);
    const seconds = this.state.remainingTime % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    this.elements.pomodoroTimer.textContent = timeString;
    
    // Update label with emoji and status
    const labels = {
      focus: "🎯 Focus Time",
      shortBreak: "☕ Short Break", 
      longBreak: "🛋️ Long Break"
    };
    
    let labelKey = 'focus';
    if (!this.state.isFocus) {
      const isLongBreak = this.state.currentSession % this.settings.sessionsBeforeLong === 0 && this.state.currentSession > 0;
      labelKey = isLongBreak ? 'longBreak' : 'shortBreak';
    }
    
    this.elements.timerLabel.textContent = labels[labelKey];
    
    // Update document title for better UX
    document.title = `${timeString} - ${labels[labelKey]}`;
    
    // Add pulsing effect when running
    if (this.state.isRunning) {
      this.elements.pomodoroTimer.classList.add('pulsing');
    } else {
      this.elements.pomodoroTimer.classList.remove('pulsing');
    }
  }

  updateSessionCount() {
    this.elements.sessionCount.textContent = `Sessions: ${this.state.currentSession}`;
  }

  updateProgressBar() {
    const percentage = ((this.state.totalTime - this.state.remainingTime) / this.state.totalTime) * 100;
    this.elements.progressFill.style.width = percentage + '%';
    
    // Update ARIA attributes
    const progressSection = document.querySelector('.progress-section');
    progressSection.setAttribute('aria-valuenow', Math.round(percentage));
    
    const minutes = Math.floor(this.state.remainingTime / 60);
    const seconds = this.state.remainingTime % 60;
    
    if (this.state.isRunning) {
      this.elements.progressText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
    } else {
      this.elements.progressText.textContent = this.state.remainingTime === this.state.totalTime ? 'Ready to start' : 'Paused';
    }
  }

  // Notification System
  showNotification(title, message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationIcon = document.getElementById('notificationIcon');
    
    // Set content
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Set icon and type
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: '📢'
    };
    
    notificationIcon.textContent = icons[type] || icons.info;
    
    // Remove existing type classes
    notification.classList.remove('success', 'warning', 'error', 'info');
    
    // Add new type class
    notification.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after duration
    setTimeout(() => {
      notification.classList.remove('show');
    }, duration);
    
    // Screen reader announcement
    const announcements = document.getElementById('announcements');
    announcements.textContent = `${title}: ${message}`;
  }

  // Enhanced timer animations
  addTimerAnimation(className, duration = 1000) {
    const timerElement = this.elements.pomodoroTimer;
    timerElement.classList.add(className);
    
    setTimeout(() => {
      timerElement.classList.remove(className);
    }, duration);
  }

  // Enhanced start/stop with animations
  startStopTimer() {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.state.isRunning = true;
    this.elements.startStopBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
    this.elements.startStopBtn.setAttribute('aria-label', 'Pause timer');
    
    // Add running animation
    this.elements.pomodoroTimer.classList.add('running');
    
    // Show notification
    const sessionType = this.state.isFocus ? 'Focus' : 'Break';
    this.showNotification(`${sessionType} Started`, `Timer started for ${Math.floor(this.state.remainingTime / 60)} minutes`, 'success');
    
    this.state.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer() {
    this.state.isRunning = false;
    this.elements.startStopBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
    this.elements.startStopBtn.setAttribute('aria-label', 'Start timer');
    
    // Remove running animation
    this.elements.pomodoroTimer.classList.remove('running');
    
    // Show notification
    this.showNotification('Timer Paused', 'You can resume anytime', 'info');
    
    clearInterval(this.state.timer);
  }

  resetTimer() {
    this.state.isRunning = false;
    this.state.remainingTime = this.state.totalTime;
    
    // Reset UI
    this.elements.startStopBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
    this.elements.startStopBtn.setAttribute('aria-label', 'Start timer');
    this.elements.pomodoroTimer.classList.remove('running');
    
    // Add reset animation
    this.addTimerAnimation('pulse');
    
    // Show notification
    this.showNotification('Timer Reset', 'Ready to start a new session', 'info');
    
    clearInterval(this.state.timer);
    this.updateDisplay();
    this.updateProgressBar();
  }

  tick() {
    this.state.remainingTime--;
    this.updateDisplay();
    this.updateProgressBar();
    
    // Add pulse animation at certain intervals
    if (this.state.remainingTime <= 10 && this.state.remainingTime > 0) {
      this.addTimerAnimation('pulse', 500);
    }
    
    if (this.state.remainingTime <= 0) {
      this.completeSession();
    }
  }

  completeSession() {
    clearInterval(this.state.timer);
    this.state.isRunning = false;
    
    // Add completion animation
    this.addTimerAnimation('pulse', 2000);
    
    // Save session to stats
    this.saveSession();
    
    // Show completion notification
    const sessionType = this.state.isFocus ? 'Focus' : 'Break';
    this.showNotification(`${sessionType} Complete!`, `Great job! ${sessionType} session completed successfully.`, 'success', 4000);
    
    // Play sound notification (if supported)
    this.playNotificationSound();
    
    // Move to next session
    this.nextSession();
  }

  playNotificationSound() {
    // Create audio context for notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  }

  nextSession() {
    if (this.state.isFocus) {
      this.state.currentSession++;
      
      if (this.state.currentSession % this.settings.sessionsBeforeLong === 0) {
        // Long break
        this.state.isFocus = false;
        this.state.remainingTime = this.settings.longBreak;
        this.state.totalTime = this.settings.longBreak;
        this.elements.timerLabel.textContent = '🛋️ Long Break';
        this.showNotification('Long Break Time!', 'Take a longer break - you\'ve earned it!', 'success');
      } else {
        // Short break
        this.state.isFocus = false;
        this.state.remainingTime = this.settings.shortBreak;
        this.state.totalTime = this.settings.shortBreak;
        this.elements.timerLabel.textContent = '☕ Short Break';
        this.showNotification('Short Break Time!', 'Take a short break to recharge', 'success');
      }
    } else {
      // Back to focus
      this.state.isFocus = true;
      this.state.remainingTime = this.settings.focusTime;
      this.state.totalTime = this.settings.focusTime;
      this.elements.timerLabel.textContent = '🎯 Focus Time';
      this.showNotification('Focus Time!', 'Ready for another productive session?', 'success');
    }
    
    this.updateDisplay();
    this.updateProgressBar();
    this.updateSessionCount();
    this.elements.startStopBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
    this.elements.startStopBtn.setAttribute('aria-label', 'Start timer');
  }

  // Settings Management
  populateSettingsForm() {
    document.getElementById('focusTime').value = this.settings.focusTime / 60;
    document.getElementById('shortBreak').value = this.settings.shortBreak / 60;
    document.getElementById('longBreak').value = this.settings.longBreak / 60;
    document.getElementById('sessionsBeforeLong').value = this.settings.sessionsBeforeLong;
    
    // Populate app size
    const savedSize = localStorage.getItem('pomodoroAppSize');
    if (savedSize && this.elements.appSize) {
      this.elements.appSize.value = savedSize;
    }
  }

  saveSettings() {
    const formData = new FormData(this.elements.settingsForm);
    const newSettings = {
      focusTime: parseInt(formData.get('focusTime')) * 60,
      shortBreak: parseInt(formData.get('shortBreak')) * 60,
      longBreak: parseInt(formData.get('longBreak')) * 60,
      sessionsBeforeLong: parseInt(formData.get('sessionsBeforeLong'))
    };
    
    // Validate settings
    if (newSettings.focusTime < 60 || newSettings.focusTime > 3600) {
      this.showNotification('Invalid Settings', 'Focus time must be between 1 and 60 minutes', 'error');
      return;
    }
    
    if (newSettings.shortBreak < 60 || newSettings.shortBreak > 1800) {
      this.showNotification('Invalid Settings', 'Short break must be between 1 and 30 minutes', 'error');
      return;
    }
    
    if (newSettings.longBreak < 300 || newSettings.longBreak > 3600) {
      this.showNotification('Invalid Settings', 'Long break must be between 5 and 60 minutes', 'error');
      return;
    }
    
    // Save settings
    this.settings = { ...newSettings };
    localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    
    // Reset current session if settings changed
    if (!this.state.isRunning) {
      this.state.remainingTime = this.state.isFocus ? this.settings.focusTime : this.settings.shortBreak;
      this.state.totalTime = this.state.remainingTime;
      this.updateDisplay();
      this.updateProgressBar();
    }
    
    this.showNotification('Settings Saved', 'Timer settings updated successfully', 'success');
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      this.state.remainingTime = this.settings.focusTime;
      this.state.totalTime = this.settings.focusTime;
    }
  }

  resetToDefaultSettings() {
    const defaults = {
      focusTime: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 20 * 60,
      sessionsBeforeLong: 4
    };
    
    this.settings = { ...defaults };
    this.state.remainingTime = this.settings.focusTime;
    this.state.totalTime = this.settings.focusTime;
    
    // Update form
    document.getElementById('focusTime').value = 25;
    document.getElementById('shortBreak').value = 5;
    document.getElementById('longBreak').value = 20;
    document.getElementById('sessionsBeforeLong').value = 4;
    
    // Reset app size
    this.updateAppSize(320);
    localStorage.removeItem('pomodoroAppSize');
    
    this.updateDisplay();
    this.updateProgressBar();
    this.showNotification("Settings reset to defaults", 'info');
  }

  // Side Panel Management
  setupSidePanel() {
    if (this.elements.sidePanelToggle) {
      this.elements.sidePanelToggle.addEventListener('click', () => {
        this.toggleSidePanel();
      });
    }
    
    if (this.elements.quickFocus) {
      this.elements.quickFocus.addEventListener('click', () => {
        this.startQuickSession(25 * 60, 'Focus');
      });
    }
    
    if (this.elements.quickBreak) {
      this.elements.quickBreak.addEventListener('click', () => {
        this.startQuickSession(5 * 60, 'Break');
      });
    }
    
    if (this.elements.clearStats) {
      this.elements.clearStats.addEventListener('click', () => {
        this.clearStatistics();
      });
    }
    
    this.updateStatsDisplay();
  }
  
  toggleSidePanel() {
    const sidebar = document.querySelector('.statistics-sidebar');
    const toggle = document.getElementById('sidePanelToggle');
    
    if (sidebar.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      toggle.innerHTML = '<span class="toggle-icon">◀</span>';
      toggle.setAttribute('aria-label', 'Hide statistics panel');
    } else {
      sidebar.classList.add('collapsed');
      toggle.innerHTML = '<span class="toggle-icon">▶</span>';
      toggle.setAttribute('aria-label', 'Show statistics panel');
    }
  }
  
  startQuickSession(duration, type) {
    this.state.remainingTime = duration;
    this.state.totalTime = duration;
    this.state.isFocus = (type === 'Focus');
    this.updateDisplay();
    this.updateProgressBar();
    this.startTimer();
  }
  
  // Statistics Management
  loadStats() {
    const savedStats = localStorage.getItem('pomodoroStats');
    if (savedStats) {
      this.stats = { ...this.stats, ...JSON.parse(savedStats) };
    }
    
    const sidePanelCollapsed = localStorage.getItem('sidePanelCollapsed');
    if (sidePanelCollapsed === 'true' && this.elements.sidePanel) {
      this.elements.sidePanel.classList.add('collapsed');
    }
  }
  
  saveStats() {
    localStorage.setItem('pomodoroStats', JSON.stringify(this.stats));
  }
  
  updateStatsDisplay() {
    if (this.elements.todayFocus) {
      this.elements.todayFocus.textContent = this.stats.todayFocus;
    }
    
    if (this.elements.totalTime) {
      const hours = Math.floor(this.stats.totalTime / 3600);
      const minutes = Math.floor((this.stats.totalTime % 3600) / 60);
      this.elements.totalTime.textContent = `${hours}h ${minutes}m`;
    }
    
    if (this.elements.streakCount) {
      this.elements.streakCount.textContent = this.stats.streakCount;
    }
    
    if (this.elements.weeklyAvg) {
      this.elements.weeklyAvg.textContent = this.stats.weeklyAvg;
    }
    
    this.updateSessionHistory();
  }
  
  updateSessionHistory() {
    const historyContainer = this.elements.sessionHistory;
    historyContainer.innerHTML = '';
    
    this.stats.sessions.forEach((session, index) => {
      const sessionItem = document.createElement('div');
      sessionItem.className = 'session-item';
      sessionItem.style.animationDelay = `${index * 0.1}s`;
      
      const duration = Math.floor(session.duration / 60);
      const timeAgo = this.getTimeAgo(session.completedAt);
      
      sessionItem.innerHTML = `
        <span class="session-time">${duration}:00</span>
        <span class="session-type">${session.type}</span>
        <span class="session-date">${timeAgo}</span>
      `;
      
      historyContainer.appendChild(sessionItem);
    });
    
    if (this.stats.sessions.length === 0) {
      historyContainer.innerHTML = '<div class="session-item">No sessions yet</div>';
    }
  }
  
  getTimeAgo(dateString) {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - sessionDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
  
  // Enhanced session saving with animations
  saveSession() {
    const sessionData = {
      type: this.state.isFocus ? 'Focus' : 'Break',
      duration: this.state.totalTime,
      completedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    
    // Add to stats
    this.stats.sessions.unshift(sessionData);
    if (this.stats.sessions.length > 10) {
      this.stats.sessions = this.stats.sessions.slice(0, 10);
    }
    
    // Update statistics
    if (this.state.isFocus) {
      this.stats.todayFocus++;
      this.stats.totalTime += this.state.totalTime;
    }
    
    this.updateStats();
    this.saveStats();
    this.updateSessionHistory();
  }

  clearStatistics() {
    if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
      this.stats = {
        todayFocus: 0,
        totalTime: 0,
        streakCount: 0,
        weeklyAvg: 0,
        sessions: []
      };
      
      this.updateStats();
      this.saveStats();
      this.updateSessionHistory();
      this.showNotification('Statistics Cleared', 'All statistics have been reset', 'success');
    }
  }

  // Enhanced theme toggle with notification
  toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    
    if (isDark) {
      body.classList.remove('dark');
      body.classList.add('light');
      this.showNotification('Light Mode', 'Switched to light theme', 'success');
    } else {
      body.classList.remove('light');
      body.classList.add('dark');
      this.showNotification('Dark Mode', 'Switched to dark theme', 'success');
    }
    
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  }

  // Enhanced app size control with notification
  updateAppSize() {
    const appSize = this.elements.appSize.value;
    
    if (appSize < 200 || appSize > 600) {
      this.showNotification('Invalid Size', 'App size must be between 200 and 600 pixels', 'error');
      return;
    }
    
    document.documentElement.style.setProperty('--app-size', appSize + 'px');
    localStorage.setItem('appSize', appSize);
    this.showNotification('Size Updated', `App size set to ${appSize}px`, 'success');
  }

  // Enhanced tab switching with animations
  switchTab(activeTab) {
    const tabs = [this.elements.timerTab, this.elements.settingsTab];
    const views = [this.elements.timerView, this.elements.settingsView];
    
    tabs.forEach((tab, index) => {
      if (tab === activeTab) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        views[index].classList.add('active');
        views[index].style.display = 'flex';
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        views[index].classList.remove('active');
        views[index].style.display = 'none';
      }
    });
  }

  // Utility Functions
  playSound(type) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const frequencies = {
        start: 440,
        pause: 330,
        complete: 660,
        'break-end': 550,
        reset: 220
      };
      
      const freq = frequencies[type] || 440;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not available');
    }
  }

  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        this.toggleTimer();
        break;
      case 'KeyR':
        e.preventDefault();
        this.resetTimer();
        break;
      case 'KeyT':
        e.preventDefault();
        this.toggleTheme();
        break;
      case 'Digit1':
        e.preventDefault();
        this.switchToTimerView();
        break;
      case 'Digit2':
        e.preventDefault();
        this.switchToSettingsView();
        break;
    }
  }

  handleVisibilityChange() {
    if (document.hidden && this.state.isRunning) {
      console.log('Timer running in background');
    } else if (!document.hidden) {
      this.updateDisplay();
      this.updateProgressBar();
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
  window.pomodoroTimer.requestNotificationPermission();
});
