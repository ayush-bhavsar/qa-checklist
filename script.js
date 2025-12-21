// script.js - Logic for QA Checklist Tool

// DOM elements
const categoryButtonsContainer = document.getElementById('category-buttons');
const checklistSection = document.getElementById('checklist-section');
const checklistTitle = document.getElementById('checklist-title');
const checklistItemsContainer = document.getElementById('checklist-items');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');

// Modal elements - will be set in setupEventListeners
let manageCategoriesBtn, manageTasksBtn, categoryManagement, taskManagement, formPanel, closeCategoryManagement, closeTaskManagement, closeFormPanel, addCategoryBtn, addTaskBtn, categoryList, taskList, itemForm, itemNameInput, formPanelTitle, taskManagementTitle, cancelFormBtn;

// Current state
let currentCategory = null;
let checkedItems = {};
let checklistData = {};
let editingItem = null; // { type: 'category'|'task', key: string, index?: number }

// Initialize the app
function init() {
  loadChecklistData();
  renderCategoryButtons();
  loadFromLocalStorage();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Get modal elements
  manageCategoriesBtn = document.getElementById('manage-categories-btn');
  manageTasksBtn = document.getElementById('manage-tasks-btn');
  categoryManagement = document.getElementById('category-management');
  taskManagement = document.getElementById('task-management');
  formPanel = document.getElementById('form-panel');
  closeCategoryManagement = document.getElementById('close-category-management');
  closeTaskManagement = document.getElementById('close-task-management');
  closeFormPanel = document.getElementById('close-form-panel');
  addCategoryBtn = document.getElementById('add-category-btn');
  addTaskBtn = document.getElementById('add-task-btn');
  categoryList = document.getElementById('category-list');
  taskList = document.getElementById('task-list');
  itemForm = document.getElementById('item-form');
  itemNameInput = document.getElementById('item-name');
  formPanelTitle = document.getElementById('form-panel-title');
  taskManagementTitle = document.getElementById('task-management-title');
  cancelFormBtn = document.getElementById('cancel-form-btn');

  if (!manageCategoriesBtn) {
    alert('Manage Categories button not found!');
    return;
  }

  // Category button clicks
  categoryButtonsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-btn')) {
      const category = e.target.dataset.category;
      selectCategory(category);
    }
  });

  // Checklist item checkbox changes
  checklistItemsContainer.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const itemText = e.target.nextElementSibling.textContent;
      checkedItems[itemText] = e.target.checked;
      updateProgress();
      saveToLocalStorage();
    }
  });

  // Reset button
  resetBtn.addEventListener('click', resetChecklist);

  // Export button
  exportBtn.addEventListener('click', exportToCSV);

  // Manage categories button
  manageCategoriesBtn.addEventListener('click', openCategoryManagement);

  // Manage tasks button
  manageTasksBtn.addEventListener('click', openTaskManagement);

  // Close buttons
  closeCategoryManagement.addEventListener('click', () => closePanel(categoryManagement));
  closeTaskManagement.addEventListener('click', () => closePanel(taskManagement));
  closeFormPanel.addEventListener('click', () => closePanel(formPanel));

  // Add buttons
  addCategoryBtn.addEventListener('click', () => openFormPanel('category'));
  addTaskBtn.addEventListener('click', () => openFormPanel('task'));

  // Form handling
  itemForm.addEventListener('submit', handleFormSubmit);
  cancelFormBtn.addEventListener('click', () => closePanel(formPanel));

  // Close modals when clicking outside
  [categoryModal, taskModal, formModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Category list actions (event delegation)
  categoryList.addEventListener('click', handleCategoryAction);

  // Task list actions (event delegation)
  taskList.addEventListener('click', handleTaskAction);
}

// Load checklist data from localStorage or use defaults
function loadChecklistData() {
  try {
    const savedData = localStorage.getItem('checklistData');
    if (savedData) {
      checklistData = JSON.parse(savedData);
    } else {
      checklistData = { ...window.defaultChecklistData };
      saveChecklistData();
    }
  } catch (e) {
    console.error('Error loading checklist data:', e);
    checklistData = { ...window.defaultChecklistData };
    saveChecklistData();
  }
}

// Save checklist data to localStorage
function saveChecklistData() {
  localStorage.setItem('checklistData', JSON.stringify(checklistData));
}

// Panel management
function openPanel(panel) {
  panel.style.display = 'block';
}

function closePanel(panel) {
  panel.style.display = 'none';
  editingItem = null;
}

// Category management
function openCategoryManagement() {
  renderCategoryList();
  openPanel(categoryManagement);
}

function openTaskManagement() {
  if (!currentCategory) {
    alert('Please select a category first.');
    return;
  }
  taskManagementTitle.textContent = `Manage Tasks - ${checklistData[currentCategory].name}`;
  renderTaskList();
  openPanel(taskManagement);
}

function renderCategoryList() {
  categoryList.innerHTML = '';
  Object.keys(checklistData).forEach(key => {
    const category = checklistData[key];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'category-item';
    itemDiv.innerHTML = `
      <span class="category-name">${category.name}</span>
      <div class="category-actions">
        <button class="btn btn-small btn-edit" data-action="edit" data-key="${key}">Edit</button>
        <button class="btn btn-small btn-delete" data-action="delete" data-key="${key}">Delete</button>
      </div>
    `;
    categoryList.appendChild(itemDiv);
  });
}

function handleCategoryAction(e) {
  const action = e.target.dataset.action;
  const key = e.target.dataset.key;
  if (!action || !key) return;

  if (action === 'edit') {
    editCategory(key);
  } else if (action === 'delete') {
    deleteCategory(key);
  }
}

function editCategory(key) {
  editingItem = { type: 'category', key };
  itemNameInput.value = checklistData[key].name;
  formPanelTitle.textContent = 'Edit Category';
  openPanel(formPanel);
}

function deleteCategory(key) {
  if (confirm(`Are you sure you want to delete the "${checklistData[key].name}" category?`)) {
    delete checklistData[key];
    saveChecklistData();
    renderCategoryList();
    renderCategoryButtons();
    if (currentCategory === key) {
      checklistSection.style.display = 'none';
      currentCategory = null;
    }
  }
}

// Task management
function openTaskManagement() {
  if (!currentCategory) {
    alert('Please select a category first.');
    return;
  }
  taskManagementTitle.textContent = `Manage Tasks - ${checklistData[currentCategory].name}`;
  renderTaskList();
  openPanel(taskManagement);
}

function renderTaskList() {
  taskList.innerHTML = '';
  checklistData[currentCategory].items.forEach((task, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'task-item';
    itemDiv.innerHTML = `
      <span class="task-name">${task}</span>
      <div class="task-actions">
        <button class="btn btn-small btn-edit" data-action="edit" data-index="${index}">Edit</button>
        <button class="btn btn-small btn-delete" data-action="delete" data-index="${index}">Delete</button>
      </div>
    `;
    taskList.appendChild(itemDiv);
  });
}

function handleTaskAction(e) {
  const action = e.target.dataset.action;
  const index = parseInt(e.target.dataset.index);
  if (!action || isNaN(index)) return;

  if (action === 'edit') {
    editTask(index);
  } else if (action === 'delete') {
    deleteTask(index);
  }
}

function editTask(index) {
  editingItem = { type: 'task', key: currentCategory, index };
  itemNameInput.value = checklistData[currentCategory].items[index];
  formPanelTitle.textContent = 'Edit Task';
  openPanel(formPanel);
}

function deleteTask(index) {
  const taskText = checklistData[currentCategory].items[index];
  if (confirm('Are you sure you want to delete this task?')) {
    checklistData[currentCategory].items.splice(index, 1);
    // Remove from checkedItems if it exists
    delete checkedItems[taskText];
    saveChecklistData();
    renderTaskList();
    renderChecklist(currentCategory);
    updateProgress();
    saveToLocalStorage();
  }
}

// Form handling
function openFormPanel(type) {
  editingItem = { type };
  itemNameInput.value = '';
  formPanelTitle.textContent = type === 'category' ? 'Add Category' : 'Add Task';
  openPanel(formPanel);
  itemNameInput.focus();
}

function handleFormSubmit(e) {
  e.preventDefault();
  const name = itemNameInput.value.trim();
  if (!name) return;

  if (editingItem.type === 'category') {
    if (editingItem.key) {
      // Edit existing category
      checklistData[editingItem.key].name = name;
    } else {
      // Add new category
      const key = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (checklistData[key]) {
        alert('A category with this name already exists.');
        return;
      }
      checklistData[key] = { name, items: [] };
    }
    saveChecklistData();
    renderCategoryList();
    renderCategoryButtons();
  } else if (editingItem.type === 'task') {
    if (editingItem.index !== undefined) {
      // Edit existing task
      const oldTask = checklistData[currentCategory].items[editingItem.index];
      checklistData[currentCategory].items[editingItem.index] = name;
      // Update checkedItems key if task text changed
      if (oldTask !== name && checkedItems[oldTask] !== undefined) {
        checkedItems[name] = checkedItems[oldTask];
        delete checkedItems[oldTask];
      }
    } else {
      // Add new task
      checklistData[currentCategory].items.push(name);
    }
    saveChecklistData();
    renderTaskList();
    renderChecklist(currentCategory);
    updateProgress();
    saveToLocalStorage();
  }

  closePanel(formPanel);
}

// Select a checklist category
function selectCategory(categoryKey) {
  currentCategory = categoryKey;

  // Update button states
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === categoryKey);
  });

  // Show checklist section
  checklistSection.style.display = 'block';

  // Render checklist
  renderChecklist(categoryKey);

  // Update progress
  updateProgress();

  // Save to localStorage
  saveToLocalStorage();
}

// Render checklist items for selected category
function renderChecklist(categoryKey) {
  const category = checklistData[categoryKey];
  checklistTitle.textContent = category.name;

  // Clear existing items
  checklistItemsContainer.innerHTML = '';

  // Create checklist items
  category.items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `item-${item.replace(/\s+/g, '-').toLowerCase()}`;
    checkbox.checked = checkedItems[item] || false;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = item;

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    checklistItemsContainer.appendChild(itemDiv);
  });
}

// Update progress bar and text
function updateProgress() {
  if (!currentCategory) return;

  const totalItems = checklistData[currentCategory].items.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Progress: ${progress}%`;
}

// Reset checklist
function resetChecklist() {
  if (!currentCategory) return;

  // Uncheck all items
  checkedItems = {};
  document.querySelectorAll('#checklist-items input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  // Update progress
  updateProgress();

  // Save to localStorage
  saveToLocalStorage();
}

// Export checklist to CSV
function exportToCSV() {
  if (!currentCategory) return;

  const category = checklistData[currentCategory];
  let csvContent = 'Checklist Type,Task,Status\n';

  category.items.forEach(item => {
    const status = checkedItems[item] ? 'Pass' : 'Not Checked';
    csvContent += `"${category.name}","${item}","${status}"\n`;
  });

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${category.name.replace(/\s+/g, '_')}_Checklist.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Save state to localStorage
function saveToLocalStorage() {
  const state = {
    selectedCategory: currentCategory,
    checkedItems: checkedItems
  };
  localStorage.setItem('qaChecklistState', JSON.stringify(state));
}

// Load state from localStorage
function loadFromLocalStorage() {
  try {
    const savedState = localStorage.getItem('qaChecklistState');
    if (savedState) {
      const state = JSON.parse(savedState);
      currentCategory = state.selectedCategory;
      checkedItems = state.checkedItems || {};

      if (currentCategory) {
        selectCategory(currentCategory);
      }
    }
  } catch (e) {
    console.error('Error loading state:', e);
    checkedItems = {};
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);