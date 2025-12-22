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
    </div>
  );
}

export default App;