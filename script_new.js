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
      this.toggleTimer();
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
    if (!this.elements.progressFill || !this.elements.progressText) return;
    
    const elapsed = this.state.totalTime - this.state.remainingTime;
    const percentage = (elapsed / this.state.totalTime) * 100;
    
    this.elements.progressFill.style.width = `${percentage}%`;
    
    // Update progress text
    if (this.state.isRunning) {
      this.elements.progressText.textContent = `${Math.round(percentage)}% complete`;
    } else if (this.state.remainingTime === this.state.totalTime) {
      this.elements.progressText.textContent = 'Ready to start';
    } else {
      this.elements.progressText.textContent = 'Paused';
    }
  }

  startTimer() {
    if (this.state.timer) return;
    
    this.state.isRunning = true;
    this.elements.startStopBtn.textContent = "⏸️ Pause";
    
    this.state.timer = setInterval(() => {
      this.state.remainingTime--;
      
      if (this.state.remainingTime < 0) {
        this.handleTimerComplete();
      } else {
        this.updateDisplay();
        this.updateProgressBar();
        
        // Notification when 1 minute left
        if (this.state.remainingTime === 60) {
          this.showNotification("1 minute remaining!");
        }
      }
    }, 1000);
    
    this.updateDisplay();
    this.playSound('start');
  }

  stopTimer() {
    clearInterval(this.state.timer);
    this.state.timer = null;
    this.state.isRunning = false;
    this.elements.startStopBtn.textContent = "▶️ Start";
    this.updateDisplay();
    this.updateProgressBar();
  }

  resetTimer() {
    this.stopTimer();
    this.state.isFocus = true;
    this.state.remainingTime = this.settings.focusTime;
    this.state.totalTime = this.settings.focusTime;
    this.updateDisplay();
    this.updateProgressBar();
    this.playSound('reset');
    
    document.title = "Pomodoro Timer";
  }

  toggleTimer() {
    if (this.state.isRunning) {
      this.stopTimer();
      this.playSound('pause');
    } else {
      this.startTimer();
    }
  }

  handleTimerComplete() {
    this.stopTimer();
    
    if (this.state.isFocus) {
      // Focus session completed
      this.state.currentSession++;
      const isLongBreak = this.state.currentSession % this.settings.sessionsBeforeLong === 0;
      
      this.state.remainingTime = isLongBreak ? this.settings.longBreak : this.settings.shortBreak;
      this.state.totalTime = isLongBreak ? this.settings.longBreak : this.settings.shortBreak;
      
      this.showNotification(
        `Focus complete! Time for a ${isLongBreak ? 'long' : 'short'} break.`,
        'success'
      );
      this.playSound('complete');
    } else {
      // Break completed
      this.state.remainingTime = this.settings.focusTime;
      this.state.totalTime = this.settings.focusTime;
      
      this.showNotification("Break's over! Ready to focus?", 'info');
      this.playSound('break-end');
    }
    
    this.state.isFocus = !this.state.isFocus;
    this.updateDisplay();
    this.updateSessionCount();
    this.updateProgressBar();
    
    // Auto-start prompt
    setTimeout(() => {
      if (confirm("Ready for the next session?")) {
        this.startTimer();
      }
    }, 2000);
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
    
    this.settings = {
      focusTime: parseInt(formData.get('focusTime')) * 60,
      shortBreak: parseInt(formData.get('shortBreak')) * 60,
      longBreak: parseInt(formData.get('longBreak')) * 60,
      sessionsBeforeLong: parseInt(formData.get('sessionsBeforeLong'))
    };
    
    // Save to localStorage
    localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    
    // Save app size
    const appSize = parseInt(formData.get('appSize'));
    if (appSize) {
      this.updateAppSize(appSize);
      localStorage.setItem('pomodoroAppSize', appSize.toString());
    }
    
    // Reset timer with new settings
    this.state.remainingTime = this.settings.focusTime;
    this.state.totalTime = this.settings.focusTime;
    this.updateDisplay();
    this.updateProgressBar();
    
    this.showNotification("Settings saved successfully!", 'success');
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

  // Utility Functions
  showNotification(message, type = 'info') {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '🍅'
      });
    }
    
    // In-app notification
    this.showInAppNotification(message, type);
  }

  showInAppNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

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
