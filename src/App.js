import React, { useState, useEffect } from 'react';
import { defaultChecklistData } from './data';

function App() {
  const [checklistData, setChecklistData] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState('');
  const [focusedTaskIndex, setFocusedTaskIndex] = useState(-1);

  // Time tracking state
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [taskTimeTracking, setTaskTimeTracking] = useState({});
  const [categoryTimeTracking, setCategoryTimeTracking] = useState({});
  const [lastBreakTime, setLastBreakTime] = useState(null);
  const [showProductivityPanel, setShowProductivityPanel] = useState(false);

  // Load checklist data from localStorage or use defaults
  useEffect(() => {
    const loadChecklistData = () => {
      try {
        const savedData = localStorage.getItem('checklistData');
        if (savedData) {
          setChecklistData(JSON.parse(savedData));
        } else {
          setChecklistData({ ...defaultChecklistData });
          localStorage.setItem('checklistData', JSON.stringify(defaultChecklistData));
        }
      } catch (e) {
        console.error('Error loading checklist data:', e);
        setChecklistData({ ...defaultChecklistData });
        localStorage.setItem('checklistData', JSON.stringify(defaultChecklistData));
      }
    };

    loadChecklistData();
  }, []);

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('qaChecklistState');
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentCategory(state.selectedCategory);
        setCheckedItems(state.checkedItems || {});
      }
    } catch (e) {
      console.error('Error loading state:', e);
      setCheckedItems({});
    }
  }, []);

  // Save checklist data to localStorage
  const saveChecklistData = (data) => {
    localStorage.setItem('checklistData', JSON.stringify(data));
  };

  // Save state to localStorage
  const saveStateToLocalStorage = () => {
    const state = {
      selectedCategory: currentCategory,
      checkedItems: checkedItems
    };
    localStorage.setItem('qaChecklistState', JSON.stringify(state));
  };

  // Select a checklist category
  const selectCategory = (categoryKey) => {
    setCurrentCategory(categoryKey);
    setFocusedTaskIndex(0); // Focus first task when category changes
    setShowTaskManagement(false);
    setShowForm(false);
  };

  // Handle checkbox change
  const handleCheckboxChange = (itemText, checked) => {
    const newCheckedItems = { ...checkedItems, [itemText]: checked };
    setCheckedItems(newCheckedItems);
  };

  // Calculate progress
  const getProgress = () => {
    if (!currentCategory || !checklistData[currentCategory]) return 0;
    const totalItems = checklistData[currentCategory].items.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  // Reset checklist
  const resetChecklist = () => {
    setCheckedItems({});
    saveStateToLocalStorage();
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!currentCategory) return;

    const category = checklistData[currentCategory];
    let csvContent = 'Checklist Type,Task,Status\n';

    category.items.forEach(item => {
      const status = checkedItems[item] ? 'Pass' : 'Not Checked';
      csvContent += `"${category.name}","${item}","${status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${category.name.replace(/\s+/g, '_')}_Checklist.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category management
  const openCategoryManagement = () => {
    setShowCategoryManagement(true);
    setShowTaskManagement(false);
    setShowForm(false);
  };

  const closeCategoryManagement = () => {
    setShowCategoryManagement(false);
  };

  const editCategory = (key) => {
    setEditingItem({ type: 'category', key });
    setFormData(checklistData[key].name);
    setShowForm(true);
  };

  const deleteCategory = (key) => {
    if (window.confirm(`Are you sure you want to delete the "${checklistData[key].name}" category?`)) {
      const newData = { ...checklistData };
      delete newData[key];
      setChecklistData(newData);
      saveChecklistData(newData);
      if (currentCategory === key) {
        setCurrentCategory(null);
      }
    }
  };

  // Task management
  const openTaskManagement = () => {
    if (!currentCategory) {
      alert('Please select a category first.');
      return;
    }
    setShowTaskManagement(true);
    setShowCategoryManagement(false);
    setShowForm(false);
  };

  const closeTaskManagement = () => {
    setShowTaskManagement(false);
  };

  const editTask = (index) => {
    setEditingItem({ type: 'task', index });
    setFormData(checklistData[currentCategory].items[index]);
    setShowForm(true);
  };

  const deleteTask = (index) => {
    const taskText = checklistData[currentCategory].items[index];
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newData = { ...checklistData };
      newData[currentCategory].items.splice(index, 1);
      setChecklistData(newData);
      saveChecklistData(newData);

      // Remove from checkedItems
      const newCheckedItems = { ...checkedItems };
      delete newCheckedItems[taskText];
      setCheckedItems(newCheckedItems);
      saveStateToLocalStorage();
    }
  };

  // Form handling
  const openForm = (type) => {
    setEditingItem({ type });
    setFormData('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const name = formData.trim();
    if (!name) return;

    if (editingItem.type === 'category') {
      if (editingItem.key) {
        // Edit existing category
        const newData = { ...checklistData };
        newData[editingItem.key].name = name;
        setChecklistData(newData);
        saveChecklistData(newData);
      } else {
        // Add new category
        const key = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (checklistData[key]) {
          alert('A category with this name already exists.');
          return;
        }
        const newData = { ...checklistData, [key]: { name, items: [] } };
        setChecklistData(newData);
        saveChecklistData(newData);
      }
    } else if (editingItem.type === 'task') {
      if (editingItem.index !== undefined) {
        // Edit existing task
        const oldTask = checklistData[currentCategory].items[editingItem.index];
        const newData = { ...checklistData };
        newData[currentCategory].items[editingItem.index] = name;
        setChecklistData(newData);
        saveChecklistData(newData);

        // Update checkedItems key if task text changed
        if (oldTask !== name && checkedItems[oldTask] !== undefined) {
          const newCheckedItems = { ...checkedItems };
          newCheckedItems[name] = newCheckedItems[oldTask];
          delete newCheckedItems[oldTask];
          setCheckedItems(newCheckedItems);
          saveStateToLocalStorage();
        }
      } else {
        // Add new task
        const newData = { ...checklistData };
        newData[currentCategory].items.push(name);
        setChecklistData(newData);
        saveChecklistData(newData);
      }
    }

    closeForm();
  };

  // Time tracking functions
  const startSession = () => {
    const now = Date.now();
    setSessionStartTime(now);
    setIsSessionActive(true);
    setLastBreakTime(now);
    localStorage.setItem('sessionStartTime', now.toString());
    localStorage.setItem('isSessionActive', 'true');
  };

  const stopSession = () => {
    if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionElapsedTime(prev => prev + elapsed);
      setIsSessionActive(false);
      setSessionStartTime(null);
      localStorage.removeItem('sessionStartTime');
      localStorage.setItem('isSessionActive', 'false');
      localStorage.setItem('sessionElapsedTime', (sessionElapsedTime + elapsed).toString());
    }
  };

  const resetSession = () => {
    setSessionStartTime(null);
    setSessionElapsedTime(0);
    setIsSessionActive(false);
    setLastBreakTime(null);
    localStorage.removeItem('sessionStartTime');
    localStorage.setItem('isSessionActive', 'false');
    localStorage.setItem('sessionElapsedTime', '0');
  };

  const getCurrentSessionTime = () => {
    if (!sessionStartTime) return sessionElapsedTime;
    return sessionElapsedTime + Math.floor((Date.now() - sessionStartTime) / 1000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const trackTaskTime = (taskText, timeSpent) => {
    setTaskTimeTracking(prev => ({
      ...prev,
      [taskText]: (prev[taskText] || 0) + timeSpent
    }));
  };

  const trackCategoryTime = (categoryKey, timeSpent) => {
    setCategoryTimeTracking(prev => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || 0) + timeSpent
    }));
  };

  const getProductivityMetrics = () => {
    const totalTasks = Object.values(checklistData).reduce((sum, category) => sum + category.items.length, 0);
    const completedTasks = Object.keys(checkedItems).filter(task => checkedItems[task]).length;
    const totalTimeSpent = Object.values(taskTimeTracking).reduce((sum, time) => sum + time, 0);
    const tasksPerHour = totalTimeSpent > 0 ? (completedTasks / (totalTimeSpent / 3600)).toFixed(2) : 0;
    
    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      totalTimeSpent,
      tasksPerHour,
      averageTimePerTask: completedTasks > 0 ? Math.floor(totalTimeSpent / completedTasks) : 0
    };
  };

  const shouldTakeBreak = () => {
    if (!lastBreakTime) return false;
    const timeSinceLastBreak = (Date.now() - lastBreakTime) / 1000 / 60; // minutes
    return timeSinceLastBreak >= 45; // Recommend break every 45 minutes
  };

  const takeBreak = () => {
    setLastBreakTime(Date.now());
  };

  // Save state when checkedItems or currentCategory changes
  useEffect(() => {
    saveStateToLocalStorage();
  }, [checkedItems, currentCategory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      switch (e.key) {
        case 'Enter':
        case ' ':
          if (!isCtrlOrCmd && currentCategory && focusedTaskIndex >= 0) {
            e.preventDefault();
            const task = checklistData[currentCategory].items[focusedTaskIndex];
            if (task) {
              handleCheckboxChange(task, !checkedItems[task]);
            }
          }
          break;

        case 'ArrowUp':
          if (!isCtrlOrCmd && currentCategory && checklistData[currentCategory].items.length > 0) {
            e.preventDefault();
            setFocusedTaskIndex(prev => 
              prev > 0 ? prev - 1 : checklistData[currentCategory].items.length - 1
            );
          }
          break;

        case 'ArrowDown':
          if (!isCtrlOrCmd && currentCategory && checklistData[currentCategory].items.length > 0) {
            e.preventDefault();
            setFocusedTaskIndex(prev => 
              prev < checklistData[currentCategory].items.length - 1 ? prev + 1 : 0
            );
          }
          break;

        case 'n':
        case 'N':
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            if (currentCategory) {
              openForm('task');
            }
          }
          break;

        case 'e':
        case 'E':
          if (isCtrlOrCmd && !isShift && currentCategory && focusedTaskIndex >= 0) {
            e.preventDefault();
            editTask(focusedTaskIndex);
          }
          break;

        case 'd':
        case 'D':
          if (isCtrlOrCmd && !isShift && currentCategory && focusedTaskIndex >= 0) {
            e.preventDefault();
            deleteTask(focusedTaskIndex);
          }
          break;

        case 'r':
        case 'R':
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            resetChecklist();
          }
          break;

        case 's':
        case 'S':
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            exportToCSV();
          }
          break;

        case 'm':
        case 'M':
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            openTaskManagement();
          } else if (isCtrlOrCmd && isShift) {
            e.preventDefault();
            openCategoryManagement();
          }
          break;

        case '/':
          if (isCtrlOrCmd) {
            e.preventDefault();
            setShowShortcutsHelp(true);
          }
          break;

        case 't':
        case 'T':
          if (isCtrlOrCmd && !isShift) {
            e.preventDefault();
            if (isSessionActive) {
              stopSession();
            } else {
              startSession();
            }
          } else if (isCtrlOrCmd && isShift) {
            e.preventDefault();
            setShowProductivityPanel(true);
          }
          break;

        case 'b':
        case 'B':
          if (isCtrlOrCmd && !isShift && shouldTakeBreak()) {
            e.preventDefault();
            takeBreak();
          }
          break;

        case 'Escape':
          if (showForm) {
            closeForm();
          } else if (showTaskManagement) {
            closeTaskManagement();
          } else if (showCategoryManagement) {
            closeCategoryManagement();
          } else if (showShortcutsHelp) {
            setShowShortcutsHelp(false);
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCategory, focusedTaskIndex, checkedItems, checklistData, showForm, showTaskManagement, showCategoryManagement, showShortcutsHelp]);

  // Load time tracking data
  useEffect(() => {
    try {
      const savedTaskTime = localStorage.getItem('taskTimeTracking');
      const savedCategoryTime = localStorage.getItem('categoryTimeTracking');
      const savedSessionElapsed = localStorage.getItem('sessionElapsedTime');
      const savedSessionActive = localStorage.getItem('isSessionActive');
      const savedSessionStart = localStorage.getItem('sessionStartTime');
      const savedLastBreak = localStorage.getItem('lastBreakTime');

      if (savedTaskTime) setTaskTimeTracking(JSON.parse(savedTaskTime));
      if (savedCategoryTime) setCategoryTimeTracking(JSON.parse(savedCategoryTime));
      if (savedSessionElapsed) setSessionElapsedTime(parseInt(savedSessionElapsed) || 0);
      if (savedSessionActive === 'true') {
        setIsSessionActive(true);
        if (savedSessionStart) setSessionStartTime(parseInt(savedSessionStart));
      }
      if (savedLastBreak) setLastBreakTime(parseInt(savedLastBreak));
    } catch (e) {
      console.error('Error loading time tracking data:', e);
    }
  }, []);

  // Save time tracking data
  useEffect(() => {
    localStorage.setItem('taskTimeTracking', JSON.stringify(taskTimeTracking));
  }, [taskTimeTracking]);

  useEffect(() => {
    localStorage.setItem('categoryTimeTracking', JSON.stringify(categoryTimeTracking));
  }, [categoryTimeTracking]);

  useEffect(() => {
    localStorage.setItem('sessionElapsedTime', sessionElapsedTime.toString());
  }, [sessionElapsedTime]);

  useEffect(() => {
    localStorage.setItem('isSessionActive', isSessionActive.toString());
  }, [isSessionActive]);

  useEffect(() => {
    if (sessionStartTime) {
      localStorage.setItem('sessionStartTime', sessionStartTime.toString());
    }
  }, [sessionStartTime]);

  useEffect(() => {
    if (lastBreakTime) {
      localStorage.setItem('lastBreakTime', lastBreakTime.toString());
    }
  }, [lastBreakTime]);

  // Session timer effect
  useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        // Update session time every second
        setSessionElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Break reminder effect
  useEffect(() => {
    if (isSessionActive && shouldTakeBreak()) {
      // Show break reminder notification
      if (Notification.permission === 'granted') {
        new Notification('Break Time!', {
          body: 'You\'ve been testing for 45 minutes. Time for a break!',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [isSessionActive, lastBreakTime]);

  return (
    <div className="container">
      <header>
        <h1>QA Checklist Tool</h1>
        <p>Track your testing progress with ease</p>
        <div className="shortcuts-hint">
          <button className="btn btn-small btn-secondary" onClick={() => setShowShortcutsHelp(true)}>
            ⌨️ Shortcuts
          </button>
        </div>
        <div className="session-timer">
          <div className="timer-display">
            <span className="timer-label">Session:</span>
            <span className={`timer-value ${isSessionActive ? 'active' : ''}`}>
              {formatTime(getCurrentSessionTime())}
            </span>
          </div>
          <div className="timer-controls">
            {!isSessionActive ? (
              <button className="btn btn-small btn-success" onClick={startSession}>
                ▶️ Start
              </button>
            ) : (
              <button className="btn btn-small btn-danger" onClick={stopSession}>
                ⏹️ Stop
              </button>
            )}
            <button className="btn btn-small btn-warning" onClick={resetSession}>
              🔄 Reset
            </button>
            <button className="btn btn-small btn-info" onClick={() => setShowProductivityPanel(true)}>
              📊 Stats
            </button>
            {shouldTakeBreak() && (
              <button className="btn btn-small btn-primary" onClick={takeBreak}>
                ☕ Break
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="category-selector">
        <div className="category-header">
          <h2>Select Checklist Category</h2>
          <button className="btn btn-secondary" onClick={openCategoryManagement}>
            Manage Categories
          </button>
        </div>
        <div className="category-buttons">
          {Object.keys(checklistData).map(categoryKey => (
            <button
              key={categoryKey}
              className={`category-btn ${currentCategory === categoryKey ? 'active' : ''}`}
              onClick={() => selectCategory(categoryKey)}
            >
              {checklistData[categoryKey].name}
            </button>
          ))}
        </div>
      </div>

      {showCategoryManagement && (
        <div className="management-panel">
          <div className="panel-header">
            <h3>Manage Categories</h3>
            <button className="close-btn" onClick={closeCategoryManagement}>&times;</button>
          </div>
          <div className="panel-body">
            <button className="btn btn-primary" onClick={() => openForm('category')}>
              Add New Category
            </button>
            <div className="category-list">
              {Object.keys(checklistData).map(key => (
                <div key={key} className="category-item">
                  <span className="category-name">{checklistData[key].name}</span>
                  <div className="category-actions">
                    <button className="btn btn-small btn-edit" onClick={() => editCategory(key)}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-delete" onClick={() => deleteCategory(key)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentCategory && (
        <div className="checklist-section">
          <div className="checklist-header">
            <h2>{checklistData[currentCategory].name}</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgress()}%` }}></div>
              </div>
              <span className="progress-text">Progress: {getProgress()}%</span>
            </div>
          </div>

          <div className="checklist-items">
            {checklistData[currentCategory].items.map((item, index) => (
              <div 
                key={index} 
                className={`checklist-item ${focusedTaskIndex === index ? 'focused' : ''}`}
                onClick={() => setFocusedTaskIndex(index)}
              >
                <input
                  type="checkbox"
                  id={`item-${index}`}
                  checked={checkedItems[item] || false}
                  onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                />
                <label htmlFor={`item-${index}`}>{item}</label>
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="btn btn-secondary" onClick={resetChecklist}>
              Reset Checklist
            </button>
            <button className="btn btn-secondary" onClick={openTaskManagement}>
              Manage Tasks
            </button>
            <button className="btn btn-primary" onClick={exportToCSV}>
              Export as CSV
            </button>
          </div>
        </div>
      )}

      {showTaskManagement && currentCategory && (
        <div className="management-panel">
          <div className="panel-header">
            <h3>Manage Tasks - {checklistData[currentCategory].name}</h3>
            <button className="close-btn" onClick={closeTaskManagement}>&times;</button>
          </div>
          <div className="panel-body">
            <button className="btn btn-primary" onClick={() => openForm('task')}>
              Add New Task
            </button>
            <div className="task-list">
              {checklistData[currentCategory].items.map((task, index) => (
                <div key={index} className="task-item">
                  <span className="task-name">{task}</span>
                  <div className="task-actions">
                    <button className="btn btn-small btn-edit" onClick={() => editTask(index)}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-delete" onClick={() => deleteTask(index)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="management-panel">
          <div className="panel-header">
            <h3>{editingItem?.type === 'category' ? (editingItem.key ? 'Edit Category' : 'Add Category') : 'Add Task'}</h3>
            <button className="close-btn" onClick={closeForm}>&times;</button>
          </div>
          <div className="panel-body">
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="item-name">Name:</label>
                <input
                  type="text"
                  id="item-name"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShortcutsHelp && (
        <div className="shortcuts-panel">
          <div className="panel-header">
            <h3>Keyboard Shortcuts</h3>
            <button className="close-btn" onClick={() => setShowShortcutsHelp(false)}>&times;</button>
          </div>
          <div className="panel-body">
            <div className="shortcuts-section">
              <h4>Navigation</h4>
              <div className="shortcut-item">
                <kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate between tasks</span>
              </div>
              <div className="shortcut-item">
                <kbd>Space</kbd> <span>Toggle task completion</span>
              </div>
            </div>
            
            <div className="shortcuts-section">
              <h4>Actions</h4>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>N</kbd> <span>Add new task</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>E</kbd> <span>Edit focused task</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>D</kbd> <span>Delete focused task</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>R</kbd> <span>Reset checklist</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>S</kbd> <span>Export as CSV</span>
              </div>
            </div>
            
            <div className="shortcuts-section">
              <h4>Management</h4>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>M</kbd> <span>Manage tasks</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> <span>Manage categories</span>
              </div>
            </div>
            
            <div className="shortcuts-section">
              <h4>⏱️ Time Tracking</h4>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>T</kbd> <span>Start/Stop session timer</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> <span>Show productivity stats</span>
              </div>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>B</kbd> <span>Take a break (when reminded)</span>
              </div>
            </div>
            
            <div className="shortcuts-section">
              <h4>General</h4>
              <div className="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>/</kbd> <span>Show this help</span>
              </div>
              <div className="shortcut-item">
                <kbd>Esc</kbd> <span>Close panels/forms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductivityPanel && (
        <div className="productivity-panel">
          <div className="panel-header">
            <h3>Productivity Analytics</h3>
            <button className="close-btn" onClick={() => setShowProductivityPanel(false)}>&times;</button>
          </div>
          <div className="panel-body">
            {(() => {
              const metrics = getProductivityMetrics();
              return (
                <div className="productivity-metrics">
                  <div className="metric-section">
                    <h4>📊 Overall Progress</h4>
                    <div className="metric-grid">
                      <div className="metric-item">
                        <span className="metric-label">Total Tasks:</span>
                        <span className="metric-value">{metrics.totalTasks}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Completed:</span>
                        <span className="metric-value">{metrics.completedTasks}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Completion Rate:</span>
                        <span className="metric-value">{metrics.completionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-section">
                    <h4>⏱️ Time Tracking</h4>
                    <div className="metric-grid">
                      <div className="metric-item">
                        <span className="metric-label">Current Session:</span>
                        <span className="metric-value">{formatTime(getCurrentSessionTime())}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Total Time Spent:</span>
                        <span className="metric-value">{formatTime(metrics.totalTimeSpent)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Avg Time/Task:</span>
                        <span className="metric-value">{formatTime(metrics.averageTimePerTask)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-section">
                    <h4>⚡ Productivity</h4>
                    <div className="metric-grid">
                      <div className="metric-item">
                        <span className="metric-label">Tasks/Hour:</span>
                        <span className="metric-value">{metrics.tasksPerHour}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Session Status:</span>
                        <span className={`metric-value ${isSessionActive ? 'active' : 'inactive'}`}>
                          {isSessionActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Break Reminder:</span>
                        <span className={`metric-value ${shouldTakeBreak() ? 'warning' : 'good'}`}>
                          {shouldTakeBreak() ? 'Take a break!' : 'Good to go'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-section">
                    <h4>📈 Category Breakdown</h4>
                    <div className="category-breakdown">
                      {Object.keys(checklistData).map(categoryKey => {
                        const category = checklistData[categoryKey];
                        const completedInCategory = category.items.filter(item => checkedItems[item]).length;
                        const categoryTime = categoryTimeTracking[categoryKey] || 0;
                        return (
                          <div key={categoryKey} className="category-metric">
                            <span className="category-name">{category.name}</span>
                            <div className="category-stats">
                              <span>{completedInCategory}/{category.items.length} tasks</span>
                              <span>{formatTime(categoryTime)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;