import React, { useState, useEffect, useMemo } from 'react';
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

  const [runTemplates, setRunTemplates] = useState([]);
  const [scheduledRuns, setScheduledRuns] = useState([]);
  const [showSchedulingPanel, setShowSchedulingPanel] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    categoryKey: '',
    frequency: 'weekly',
    targetDueDate: '',
    dueLeadDays: 0
  });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [activeScheduleTab, setActiveScheduleTab] = useState('templates');

  // Time tracking state
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [taskTimeTracking, setTaskTimeTracking] = useState({});
  const [categoryTimeTracking, setCategoryTimeTracking] = useState({});
  const [lastBreakTime, setLastBreakTime] = useState(null);
  const [showProductivityPanel, setShowProductivityPanel] = useState(false);

  const frequencyOptions = useMemo(() => ([
    { value: 'daily', label: 'Daily', days: 1 },
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'biweekly', label: 'Bi-Weekly', days: 14 },
    { value: 'monthly', label: 'Monthly', days: 30 }
  ]), []);

  const baseCategoryKeys = useMemo(
    () => Object.keys(checklistData || {}).filter(key => !checklistData[key]?.meta?.isRunInstance),
    [checklistData]
  );

  const sortedRuns = useMemo(() => {
    return [...scheduledRuns].sort((a, b) => {
      const aDate = new Date(a.dueDate || 0).getTime();
      const bDate = new Date(b.dueDate || 0).getTime();
      return aDate - bDate;
    });
  }, [scheduledRuns]);

  const getItemKey = (categoryKey, itemText) => `${categoryKey}::${itemText}`;

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

  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('runTemplates');
      const savedRuns = localStorage.getItem('scheduledRuns');
      if (savedTemplates) {
        setRunTemplates(JSON.parse(savedTemplates));
      }
      if (savedRuns) {
        setScheduledRuns(JSON.parse(savedRuns));
      }
    } catch (e) {
      console.error('Error loading scheduling data:', e);
      setRunTemplates([]);
      setScheduledRuns([]);
    }
  }, []);

  // Save checklist data to localStorage
  const saveChecklistData = (data) => {
    localStorage.setItem('checklistData', JSON.stringify(data));
  };

  const saveRunTemplates = (templates) => {
    localStorage.setItem('runTemplates', JSON.stringify(templates));
  };

  const saveScheduledRuns = (runs) => {
    localStorage.setItem('scheduledRuns', JSON.stringify(runs));
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
  const handleCheckboxChange = (categoryKey, itemText, checked) => {
    if (!categoryKey) {
      return;
    }
    const itemKey = getItemKey(categoryKey, itemText);
    const newCheckedItems = { ...checkedItems };
    if (checked) {
      newCheckedItems[itemKey] = true;
    } else if (newCheckedItems[itemKey]) {
      delete newCheckedItems[itemKey];
    }
    setCheckedItems(newCheckedItems);
  };

  const isItemChecked = (categoryKey, itemText) => {
    if (!categoryKey) {
      return false;
    }
    return Boolean(checkedItems[getItemKey(categoryKey, itemText)]);
  };

  // Calculate progress
  const getCategoryProgress = (categoryKey) => {
    if (!categoryKey || !checklistData[categoryKey]) {
      return 0;
    }
    const items = checklistData[categoryKey].items || [];
    if (!items.length) {
      return 0;
    }
    const checkedCount = items.filter(item => isItemChecked(categoryKey, item)).length;
    return Math.round((checkedCount / items.length) * 100);
  };

  const getProgress = () => getCategoryProgress(currentCategory);

  const currentRunMeta = currentCategory ? checklistData[currentCategory]?.meta : null;
  const currentRunRecord = currentRunMeta?.runId ? scheduledRuns.find(run => run.id === currentRunMeta.runId) : null;
  const currentRunOverdue = currentRunMeta?.dueDate ? isRunOverdue(currentRunMeta.dueDate, currentRunRecord?.status) : false;

  // Reset checklist
  const clearCategoryChecks = (categoryKey) => {
    if (!categoryKey) {
      return;
    }
    setCheckedItems(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key.startsWith(`${categoryKey}::`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const resetChecklist = () => {
    clearCategoryChecks(currentCategory);
    saveStateToLocalStorage();
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!currentCategory) return;

    const category = checklistData[currentCategory];
    let csvContent = 'Checklist Type,Task,Status\n';

    category.items.forEach(item => {
      const status = isItemChecked(currentCategory, item) ? 'Pass' : 'Not Checked';
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
      const runMeta = checklistData[key]?.meta;
      const newData = { ...checklistData };
      delete newData[key];
      setChecklistData(newData);
      saveChecklistData(newData);
      clearCategoryChecks(key);
      if (currentCategory === key) {
        setCurrentCategory(null);
      }
      if (runMeta?.runId) {
        setScheduledRuns(prev => {
          const updated = prev.filter(run => run.id !== runMeta.runId);
          if (updated.length !== prev.length) {
            saveScheduledRuns(updated);
          }
          return updated;
        });
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
      const itemKey = getItemKey(currentCategory, taskText);
      setCheckedItems(prev => {
        if (!prev[itemKey]) {
          return prev;
        }
        const updated = { ...prev };
        delete updated[itemKey];
        return updated;
      });
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
        const oldKey = getItemKey(currentCategory, oldTask);
        const newKey = getItemKey(currentCategory, name);
        if (oldKey !== newKey && checkedItems[oldKey]) {
          const newCheckedItems = { ...checkedItems };
          newCheckedItems[newKey] = newCheckedItems[oldKey];
          delete newCheckedItems[oldKey];
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

  const getFrequencyDays = (frequency) => {
    const match = frequencyOptions.find(option => option.value === frequency);
    return match ? match.days : 7;
  };

  const getFrequencyLabel = (frequency) => {
    const match = frequencyOptions.find(option => option.value === frequency);
    return match ? match.label : frequency;
  };

  const advanceDueDate = (isoDate, frequency) => {
    const base = isoDate ? new Date(isoDate) : null;
    if (!base || Number.isNaN(base.getTime())) {
      return null;
    }
    const next = new Date(base.getTime());
    next.setDate(next.getDate() + getFrequencyDays(frequency));
    return next;
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) {
      return 'N/A';
    }
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return 'N/A';
    }
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toDateInputValue = (isoDate) => {
    if (!isoDate) {
      return '';
    }
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toISOString().split('T')[0];
  };

  const dateFromInput = (dateString) => {
    if (!dateString) {
      return null;
    }
    const parsed = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  };

  const calculateLeadStart = (dueDateIso, leadDays) => {
    if (!dueDateIso) {
      return null;
    }
    const due = new Date(dueDateIso);
    if (Number.isNaN(due.getTime())) {
      return null;
    }
    const threshold = new Date(due.getTime());
    threshold.setDate(threshold.getDate() - Math.max(0, leadDays));
    return threshold;
  };

  const isRunOverdue = (dueDateIso, status) => {
    if (!dueDateIso || status === 'completed') {
      return false;
    }
    const due = new Date(dueDateIso);
    if (Number.isNaN(due.getTime())) {
      return false;
    }
    return due < new Date();
  };

  const generateRunTitle = (baseName, templateName, dueDateIso) => {
    const dueLabel = formatDateForDisplay(dueDateIso);
    return `${baseName} • ${templateName} (Due ${dueLabel})`;
  };

  const createRunFromTemplate = (template, dueDateIso, { manualTrigger = false } = {}) => {
    if (!template || !dueDateIso) {
      return null;
    }

    const baseCategory = checklistData[template.categoryKey];
    if (!baseCategory) {
      return null;
    }

    const dueDate = new Date(dueDateIso);
    if (Number.isNaN(dueDate.getTime())) {
      return null;
    }

    const dueStamp = dueDate.toISOString().replace(/[^0-9]/g, '');
    const runId = `run-${template.id}-${dueStamp}`;
    if (scheduledRuns.some(run => run.id === runId)) {
      return null;
    }

    const generatedAt = new Date().toISOString();
    const categoryKey = `run-${template.id}-${Date.now().toString(36)}`;
    const categoryEntry = {
      ...baseCategory,
      name: generateRunTitle(baseCategory.name, template.name, dueDateIso),
      items: [...(baseCategory.items || [])],
      meta: {
        ...(baseCategory.meta || {}),
        isRunInstance: true,
        runId,
        templateId: template.id,
        dueDate: dueDateIso,
        generatedAt,
        sourceCategory: template.categoryKey,
        leadDays: template.dueLeadDays || 0
      }
    };

    setChecklistData(prev => {
      const updated = { ...prev, [categoryKey]: categoryEntry };
      saveChecklistData(updated);
      return updated;
    });

    const runRecord = {
      id: runId,
      templateId: template.id,
      templateName: template.name,
      sourceCategoryKey: template.categoryKey,
      sourceCategoryName: baseCategory.name,
      categoryKey,
      dueDate: dueDateIso,
      leadDays: template.dueLeadDays || 0,
      status: 'pending',
      createdAt: generatedAt,
      manual: manualTrigger
    };

    setScheduledRuns(prev => {
      const updated = [...prev, runRecord];
      saveScheduledRuns(updated);
      return updated;
    });

    return runRecord;
  };

  const resetTemplateFormState = () => {
    setTemplateFormData({
      name: '',
      categoryKey: '',
      frequency: 'weekly',
      targetDueDate: '',
      dueLeadDays: 0
    });
    setEditingTemplateId(null);
  };

  const openSchedulingPanel = () => {
    setShowSchedulingPanel(true);
    setShowCategoryManagement(false);
    setShowTaskManagement(false);
    setShowForm(false);
    setShowShortcutsHelp(false);
    setShowTemplateForm(false);
    resetTemplateFormState();
  };

  const closeSchedulingPanel = () => {
    setShowSchedulingPanel(false);
    setShowTemplateForm(false);
    resetTemplateFormState();
  };

  const openTemplateFormModal = (templateId = null) => {
    setShowTemplateForm(true);
    if (templateId) {
      const template = runTemplates.find(t => t.id === templateId);
      if (template) {
        setEditingTemplateId(templateId);
        setTemplateFormData({
          name: template.name,
          categoryKey: template.categoryKey,
          frequency: template.frequency,
          targetDueDate: toDateInputValue(template.nextDueDate),
          dueLeadDays: template.dueLeadDays || 0
        });
      }
    } else {
      resetTemplateFormState();
    }
  };

  const handleTemplateFormChange = (field, value) => {
    setTemplateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateFormSubmit = (e) => {
    e.preventDefault();
    const { name, categoryKey, frequency, targetDueDate, dueLeadDays } = templateFormData;
    if (!name.trim() || !categoryKey || !frequency || !targetDueDate) {
      return;
    }

    const dueDate = dateFromInput(targetDueDate);
    if (!dueDate) {
      alert('Please provide a valid due date.');
      return;
    }

    const parsedLead = parseInt(dueLeadDays, 10);
    const normalizedLead = Number.isNaN(parsedLead) ? 0 : parsedLead;

    if (editingTemplateId) {
      setRunTemplates(prev => prev.map(template => {
        if (template.id !== editingTemplateId) {
          return template;
        }
        return {
          ...template,
          name: name.trim(),
          categoryKey,
          frequency,
          dueLeadDays: Math.max(0, normalizedLead),
          nextDueDate: dueDate.toISOString()
        };
      }));
    } else {
      const id = `tmpl-${Date.now().toString(36)}`;
      const newTemplate = {
        id,
        name: name.trim(),
        categoryKey,
        frequency,
        dueLeadDays: Math.max(0, normalizedLead),
        nextDueDate: dueDate.toISOString()
      };
      setRunTemplates(prev => [...prev, newTemplate]);
    }

    setShowTemplateForm(false);
    resetTemplateFormState();
  };

  const deleteTemplate = (templateId) => {
    const template = runTemplates.find(t => t.id === templateId);
    if (!template) {
      return;
    }
    if (!window.confirm(`Delete the "${template.name}" schedule template?`)) {
      return;
    }
    setRunTemplates(prev => prev.filter(t => t.id !== templateId));
    if (editingTemplateId === templateId) {
      resetTemplateFormState();
      setShowTemplateForm(false);
    }
  };

  const generateRunImmediately = (templateId) => {
    const template = runTemplates.find(t => t.id === templateId);
    if (!template) {
      return;
    }
    const run = createRunFromTemplate(template, template.nextDueDate || new Date().toISOString(), { manualTrigger: true });
    if (run) {
      setRunTemplates(prev => prev.map(t => {
        if (t.id !== templateId) {
          return t;
        }
        const nextDue = advanceDueDate(t.nextDueDate, t.frequency);
        return {
          ...t,
          nextDueDate: nextDue ? nextDue.toISOString() : t.nextDueDate
        };
      }));
    }
  };

  const updateRunStatus = (runId, status) => {
    setScheduledRuns(prev => {
      let changed = false;
      const updated = prev.map(run => {
        if (run.id !== runId) {
          return run;
        }
        changed = true;
        return {
          ...run,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        };
      });
      if (changed) {
        saveScheduledRuns(updated);
      }
      return changed ? updated : prev;
    });
  };

  const markRunComplete = (runId) => {
    const run = scheduledRuns.find(r => r.id === runId);
    if (run && checklistData[run.categoryKey]) {
      const itemsToCheck = checklistData[run.categoryKey].items || [];
      setCheckedItems(prev => {
        const updated = { ...prev };
        itemsToCheck.forEach(item => {
          updated[getItemKey(run.categoryKey, item)] = true;
        });
        return updated;
      });
    }
    updateRunStatus(runId, 'completed');
  };

  const reopenRun = (runId) => {
    updateRunStatus(runId, 'pending');
  };

  const removeRun = (runId) => {
    const run = scheduledRuns.find(r => r.id === runId);
    if (!run) {
      return;
    }
    if (!window.confirm('Archive this scheduled run?')) {
      return;
    }
    setScheduledRuns(prev => {
      const updated = prev.filter(r => r.id !== runId);
      saveScheduledRuns(updated);
      return updated;
    });
    setChecklistData(prev => {
      if (!run.categoryKey || !prev[run.categoryKey]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[run.categoryKey];
      saveChecklistData(updated);
      return updated;
    });
    clearCategoryChecks(run.categoryKey);
    if (currentCategory === run.categoryKey) {
      setCurrentCategory(null);
    }
  };

  const openRunFromPanel = (runId) => {
    const run = scheduledRuns.find(r => r.id === runId);
    if (!run) {
      return;
    }
    if (!checklistData[run.categoryKey]) {
      alert('This run checklist is no longer available.');
      return;
    }
    setShowSchedulingPanel(false);
    setCurrentCategory(run.categoryKey);
    setFocusedTaskIndex(0);
  };

  // Save state when checkedItems or currentCategory changes
  useEffect(() => {
    saveStateToLocalStorage();
  }, [checkedItems, currentCategory]);

  useEffect(() => {
    if (!checklistData || Object.keys(checklistData).length === 0) {
      return;
    }
    const hasLegacyKeys = Object.keys(checkedItems || {}).some(key => key && !key.includes('::'));
    if (!hasLegacyKeys) {
      return;
    }
    const normalized = {};
    Object.entries(checkedItems).forEach(([itemText, value]) => {
      if (!value) {
        return;
      }
      Object.keys(checklistData).forEach(categoryKey => {
        if (checklistData[categoryKey]?.items?.includes(itemText)) {
          normalized[getItemKey(categoryKey, itemText)] = true;
        }
      });
    });
    setCheckedItems(normalized);
  }, [checklistData, checkedItems]);

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
              handleCheckboxChange(currentCategory, task, !isItemChecked(currentCategory, task));
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

  useEffect(() => {
    if (!runTemplates.length || Object.keys(checklistData).length === 0) {
      return;
    }
    const now = new Date();
    let templatesChanged = false;
    const nextTemplates = runTemplates.map(template => {
      if (!template.nextDueDate) {
        return template;
      }
      const threshold = calculateLeadStart(template.nextDueDate, template.dueLeadDays || 0) || new Date(template.nextDueDate);
      if (threshold > now) {
        return template;
      }
      const runCreated = createRunFromTemplate(template, template.nextDueDate);
      if (!runCreated) {
        return template;
      }
      const nextDue = advanceDueDate(template.nextDueDate, template.frequency);
      templatesChanged = true;
      return {
        ...template,
        nextDueDate: nextDue ? nextDue.toISOString() : template.nextDueDate
      };
    });
    if (templatesChanged) {
      setRunTemplates(nextTemplates);
    }
  }, [runTemplates, checklistData]);

  useEffect(() => {
    saveRunTemplates(runTemplates);
  }, [runTemplates]);

  useEffect(() => {
    saveScheduledRuns(scheduledRuns);
  }, [scheduledRuns]);

  useEffect(() => {
    if (!scheduledRuns.length) {
      return;
    }
    setScheduledRuns(prevRuns => {
      let changed = false;
      const updated = prevRuns.map(run => {
        const category = checklistData[run.categoryKey];
        if (!category) {
          return run;
        }
        const progress = getCategoryProgress(run.categoryKey);
        if (progress === 100 && run.status !== 'completed') {
          changed = true;
          return {
            ...run,
            status: 'completed',
            completedAt: new Date().toISOString()
          };
        }
        if (progress < 100 && run.status === 'completed') {
          changed = true;
          return {
            ...run,
            status: 'pending',
            completedAt: undefined
          };
        }
        return run;
      });
      if (changed) {
        saveScheduledRuns(updated);
        return updated;
      }
      return prevRuns;
    });
  }, [checkedItems, checklistData, scheduledRuns]);

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
    <div className="container" data-testid="qa-checklist-app">
      <header data-testid="app-header">
        <h1 data-testid="app-title">QA Checklist Tool</h1>
        <p data-testid="app-subtitle">Track your testing progress with ease</p>
        <div className="shortcuts-hint">
          <button className="btn btn-small btn-secondary" onClick={() => setShowShortcutsHelp(true)} data-testid="shortcuts-button">
            <span className="icon-keyboard"></span> Shortcuts
          </button>
        </div>
        <div className="session-timer" data-testid="session-timer">
          <div className="timer-display">
            <span className="timer-label" data-testid="timer-label">Session:</span>
            <span className={`timer-value ${isSessionActive ? 'active' : ''}`} data-testid="timer-value">
              {formatTime(getCurrentSessionTime())}
            </span>
          </div>
          <div className="timer-controls" data-testid="timer-controls">
            {!isSessionActive ? (
              <button className="btn btn-small btn-success" onClick={startSession} data-testid="start-session-btn">
                <span className="icon-play"></span> Start
              </button>
            ) : (
              <button className="btn btn-small btn-danger" onClick={stopSession} data-testid="stop-session-btn">
                <span className="icon-stop"></span> Stop
              </button>
            )}
            <button className="btn btn-small btn-warning" onClick={resetSession} data-testid="reset-session-btn">
              <span className="icon-reset"></span> Reset
            </button>
            <button className="btn btn-small btn-info" onClick={() => setShowProductivityPanel(true)} data-testid="stats-btn">
              <span className="icon-stats"></span> Stats
            </button>
            {shouldTakeBreak() && (
              <button className="btn btn-small btn-primary" onClick={takeBreak} data-testid="break-btn">
                <span className="icon-coffee"></span> Break
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="category-selector" data-testid="category-selector">
        <div className="category-header">
          <h2 data-testid="category-selector-title">Select Checklist Category</h2>
          <button className="btn btn-secondary" onClick={openCategoryManagement} data-testid="manage-categories-btn">
            Manage Categories
          </button>
          <button className="btn btn-secondary" onClick={openSchedulingPanel} data-testid="manage-schedules-btn">
            Manage Schedules
          </button>
        </div>
        <div className="category-buttons" data-testid="category-buttons">
          {Object.keys(checklistData).map(categoryKey => (
            <button
              key={categoryKey}
              className={`category-btn ${currentCategory === categoryKey ? 'active' : ''}`}
              onClick={() => selectCategory(categoryKey)}
              data-testid={`category-btn-${categoryKey}`}
            >
              {checklistData[categoryKey].name}
            </button>
          ))}
        </div>
      </div>

      {showCategoryManagement && (
        <div className="management-panel" data-testid="category-management-panel">
          <div className="panel-header">
            <h3 data-testid="category-panel-title">Manage Categories</h3>
            <button className="close-btn" onClick={closeCategoryManagement} data-testid="close-category-panel-btn">&times;</button>
          </div>
          <div className="panel-body">
            <button className="btn btn-primary" onClick={() => openForm('category')} data-testid="add-category-btn">
              Add New Category
            </button>
            <div className="category-list" data-testid="category-list">
              {Object.keys(checklistData).map(key => (
                <div key={key} className="category-item" data-testid={`category-item-${key}`}>
                  <span className="category-name" data-testid={`category-name-${key}`}>{checklistData[key].name}</span>
                  <div className="category-actions">
                    <button className="btn btn-small btn-edit" onClick={() => editCategory(key)} data-testid={`edit-category-btn-${key}`}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-delete" onClick={() => deleteCategory(key)} data-testid={`delete-category-btn-${key}`}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSchedulingPanel && (
        <div className="management-panel scheduling-panel" data-testid="scheduling-panel">
          <div className="panel-header">
            <h3 data-testid="scheduling-title">Recurring Test Runs</h3>
            <button className="close-btn" onClick={closeSchedulingPanel} data-testid="close-scheduling-panel-btn">&times;</button>
          </div>
          <div className="panel-body scheduling-body">
            <div className="schedule-tabs" data-testid="scheduling-tabs">
              <button
                className={`tab-btn ${activeScheduleTab === 'templates' ? 'active' : ''}`}
                onClick={() => {
                  setActiveScheduleTab('templates');
                }}
                data-testid="templates-tab-btn"
              >
                Templates
              </button>
              <button
                className={`tab-btn ${activeScheduleTab === 'runs' ? 'active' : ''}`}
                onClick={() => {
                  setActiveScheduleTab('runs');
                  setShowTemplateForm(false);
                }}
                data-testid="runs-tab-btn"
              >
                Scheduled Runs
              </button>
            </div>

            {activeScheduleTab === 'templates' && (
              <div className="schedule-section" data-testid="template-section">
                <div className="section-header">
                  <button className="btn btn-primary" onClick={() => openTemplateFormModal()} data-testid="add-template-btn">
                    Add Template
                  </button>
                </div>
                {runTemplates.length === 0 ? (
                  <p className="empty-state" data-testid="empty-templates">No recurring templates yet.</p>
                ) : (
                  <div className="template-list" data-testid="template-list">
                    {runTemplates.map(template => {
                      const baseName = checklistData[template.categoryKey]?.name || 'Unavailable category';
                      return (
                        <div key={template.id} className="template-item" data-testid={`template-item-${template.id}`}>
                          <div className="template-details">
                            <h4>{template.name}</h4>
                            <div className="template-meta-grid">
                              <span><strong>Base:</strong> {baseName}</span>
                              <span><strong>Cadence:</strong> {getFrequencyLabel(template.frequency)}</span>
                              <span><strong>Due:</strong> {formatDateForDisplay(template.nextDueDate)}</span>
                              <span><strong>Clone Lead:</strong> {Math.max(0, template.dueLeadDays || 0)} day(s)</span>
                            </div>
                          </div>
                          <div className="template-actions">
                            <button className="btn btn-small btn-secondary" onClick={() => openTemplateFormModal(template.id)} data-testid={`edit-template-btn-${template.id}`}>
                              Edit
                            </button>
                            <button className="btn btn-small btn-info" onClick={() => generateRunImmediately(template.id)} data-testid={`generate-template-btn-${template.id}`}>
                              Generate Now
                            </button>
                            <button className="btn btn-small btn-delete" onClick={() => deleteTemplate(template.id)} data-testid={`delete-template-btn-${template.id}`}>
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeScheduleTab === 'runs' && (
              <div className="schedule-section" data-testid="runs-section">
                {sortedRuns.length === 0 ? (
                  <p className="empty-state" data-testid="empty-runs">No upcoming runs yet.</p>
                ) : (
                  <div className="run-list" data-testid="run-list">
                    {sortedRuns.map(run => {
                      const category = checklistData[run.categoryKey];
                      const progress = getCategoryProgress(run.categoryKey);
                      const overdue = isRunOverdue(run.dueDate, run.status);
                      return (
                        <div key={run.id} className={`run-item ${overdue ? 'overdue' : ''}`} data-testid={`run-item-${run.id}`}>
                          <div className="run-summary">
                            <h4>{run.templateName} &mdash; {formatDateForDisplay(run.dueDate)}</h4>
                            <div className="run-meta-grid">
                              <span><strong>Status:</strong> {run.status === 'completed' ? 'Completed' : overdue ? 'Overdue' : 'Pending'}</span>
                              <span><strong>Checklist:</strong> {category ? category.name : 'Removed'}</span>
                              <span><strong>Progress:</strong> {progress}%</span>
                            </div>
                          </div>
                          <div className="run-actions">
                            <button className="btn btn-small btn-primary" onClick={() => openRunFromPanel(run.id)} data-testid={`open-run-btn-${run.id}`} disabled={!category}>
                              Open
                            </button>
                            {run.status !== 'completed' ? (
                              <button className="btn btn-small btn-success" onClick={() => markRunComplete(run.id)} data-testid={`complete-run-btn-${run.id}`}>
                                Mark Complete
                              </button>
                            ) : (
                              <button className="btn btn-small btn-secondary" onClick={() => reopenRun(run.id)} data-testid={`reopen-run-btn-${run.id}`}>
                                Reopen
                              </button>
                            )}
                            <button className="btn btn-small btn-delete" onClick={() => removeRun(run.id)} data-testid={`remove-run-btn-${run.id}`}>
                              Archive
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {showTemplateForm && (
              <div className="template-form" data-testid="template-form">
                <form onSubmit={handleTemplateFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="template-name">Template Name</label>
                    <input
                      id="template-name"
                      type="text"
                      value={templateFormData.name}
                      onChange={(e) => handleTemplateFormChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="template-category">Base Category</label>
                    <select
                      id="template-category"
                      value={templateFormData.categoryKey}
                      onChange={(e) => handleTemplateFormChange('categoryKey', e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {baseCategoryKeys.map(key => (
                        <option key={key} value={key}>{checklistData[key]?.name || key}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="template-frequency">Frequency</label>
                    <select
                      id="template-frequency"
                      value={templateFormData.frequency}
                      onChange={(e) => handleTemplateFormChange('frequency', e.target.value)}
                      required
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="template-due">Next Due Date</label>
                    <input
                      id="template-due"
                      type="date"
                      value={templateFormData.targetDueDate}
                      onChange={(e) => handleTemplateFormChange('targetDueDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="template-lead">Clone Lead (days before due)</label>
                    <input
                      id="template-lead"
                      type="number"
                      min="0"
                      value={templateFormData.dueLeadDays}
                      onChange={(e) => handleTemplateFormChange('dueLeadDays', e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowTemplateForm(false); resetTemplateFormState(); }} data-testid="cancel-template-btn">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" data-testid="save-template-btn">
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {currentCategory && (
        <div className="checklist-section" data-testid="checklist-section">
          <div className="checklist-header">
            <h2 data-testid="checklist-title">{checklistData[currentCategory].name}</h2>
            <div className="progress-container" data-testid="progress-container">
              <div className="progress-bar" data-testid="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgress()}%` }} data-testid="progress-fill"></div>
              </div>
              <span className="progress-text" data-testid="progress-text">Progress: {getProgress()}%</span>
            </div>
            {currentRunMeta?.dueDate && (
              <div className={`due-banner ${currentRunOverdue ? 'overdue' : ''}`} data-testid="due-banner">
                Due by {formatDateForDisplay(currentRunMeta.dueDate)}
              </div>
            )}
          </div>

          <div className="checklist-items" data-testid="checklist-items">
            {checklistData[currentCategory].items.map((item, index) => (
              <div
                key={index}
                className={`checklist-item ${focusedTaskIndex === index ? 'focused' : ''}`}
                onClick={() => setFocusedTaskIndex(index)}
                data-testid={`checklist-item-${index}`}
              >
                <input
                  type="checkbox"
                  id={`item-${index}`}
                  checked={isItemChecked(currentCategory, item)}
                  onChange={(e) => handleCheckboxChange(currentCategory, item, e.target.checked)}
                  data-testid={`checklist-checkbox-${index}`}
                />
                <label htmlFor={`item-${index}`} data-testid={`checklist-label-${index}`}>{item}</label>
              </div>
            ))}
          </div>

          <div className="actions" data-testid="checklist-actions">
            <button className="btn btn-secondary" onClick={resetChecklist} data-testid="reset-checklist-btn">
              Reset Checklist
            </button>
            <button className="btn btn-secondary" onClick={openTaskManagement} data-testid="manage-tasks-btn">
              Manage Tasks
            </button>
            <button className="btn btn-primary" onClick={exportToCSV} data-testid="export-csv-btn">
              Export as CSV
            </button>
          </div>
        </div>
      )}

      {showTaskManagement && currentCategory && (
        <div className="management-panel" data-testid="task-management-panel">
          <div className="panel-header">
            <h3 data-testid="task-panel-title">Manage Tasks - {checklistData[currentCategory].name}</h3>
            <button className="close-btn" onClick={closeTaskManagement} data-testid="close-task-panel-btn">&times;</button>
          </div>
          <div className="panel-body">
            <button className="btn btn-primary" onClick={() => openForm('task')} data-testid="add-task-btn">
              Add New Task
            </button>
            <div className="task-list" data-testid="task-list">
              {checklistData[currentCategory].items.map((task, index) => (
                <div key={index} className="task-item" data-testid={`task-item-${index}`}>
                  <span className="task-name" data-testid={`task-name-${index}`}>{task}</span>
                  <div className="task-actions">
                    <button className="btn btn-small btn-edit" onClick={() => editTask(index)} data-testid={`edit-task-btn-${index}`}>
                      Edit
                    </button>
                    <button className="btn btn-small btn-delete" onClick={() => deleteTask(index)} data-testid={`delete-task-btn-${index}`}>
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
        <div className="management-panel" data-testid="form-modal">
          <div className="panel-header">
            <h3 data-testid="form-title">{editingItem?.type === 'category' ? (editingItem.key ? 'Edit Category' : 'Add Category') : 'Add Task'}</h3>
            <button className="close-btn" onClick={closeForm} data-testid="close-form-btn">&times;</button>
          </div>
          <div className="panel-body">
            <form onSubmit={handleFormSubmit} data-testid="item-form">
              <div className="form-group">
                <label htmlFor="item-name" data-testid="item-name-label">Name:</label>
                <input
                  type="text"
                  id="item-name"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  required
                  data-testid="item-name-input"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm} data-testid="cancel-form-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-form-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShortcutsHelp && (
        <div className="shortcuts-panel" data-testid="shortcuts-panel">
          <div className="panel-header">
            <h3 data-testid="shortcuts-title">Keyboard Shortcuts</h3>
            <button className="close-btn" onClick={() => setShowShortcutsHelp(false)} data-testid="close-shortcuts-btn">&times;</button>
          </div>
          <div className="panel-body" data-testid="shortcuts-body">
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
              <h4><span className="icon-clock"></span> Time Tracking</h4>
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
        <div className="productivity-panel" data-testid="productivity-panel">
          <div className="panel-header">
            <h3 data-testid="productivity-title">Productivity Analytics</h3>
            <button className="close-btn" onClick={() => setShowProductivityPanel(false)} data-testid="close-productivity-btn">&times;</button>
          </div>
          <div className="panel-body" data-testid="productivity-body">
            {(() => {
              const metrics = getProductivityMetrics();
              return (
                <div className="productivity-metrics">
                  <div className="metric-section">
                    <h4><span className="icon-chart"></span> Overall Progress</h4>
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
                    <h4><span className="icon-clock"></span> Time Tracking</h4>
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
                    <h4><span className="icon-flash"></span> Productivity</h4>
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
                    <h4><span className="icon-trend"></span> Category Breakdown</h4>
                    <div className="category-breakdown">
                      {Object.keys(checklistData).map(categoryKey => {
                        const category = checklistData[categoryKey];
                        const completedInCategory = category.items.filter(item => isItemChecked(categoryKey, item)).length;
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