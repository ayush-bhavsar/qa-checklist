# QA Checklist Tool

<div align="center">

[![React Version](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

A comprehensive, professional React-based QA testing checklist management tool with time tracking, productivity analytics, and advanced testing workflow features.

[Live Demo](#) • [Documentation](#features) • [Testing](#testing)

</div>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Customization](#customization)
- [Browser Support](#browser-support)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

### Core Functionality

- **Multiple Testing Categories** - Pre-built categories for Smoke, Regression, UI, Functional, and API testing
- **Custom Management** - Add, edit, and delete custom categories and tasks
- **Real-time Progress Tracking** - Visual progress bars with completion percentages
- **Persistent Storage** - Automatic saving using localStorage
- **Export Capabilities** - Export checklists as CSV files
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Time Tracking & Productivity

- **Session Timer** - Track active testing session time with start/stop/reset controls
- **Productivity Analytics** - Comprehensive metrics including tasks per hour, completion rates
- **Break Reminders** - Automated 45-minute break notifications to prevent fatigue
- **Detailed Reports** - Category-wise time tracking and performance insights
- **Session Management** - Persistent session state across browser refreshes

### Advanced User Experience

- **Keyboard Shortcuts** - Full keyboard navigation and shortcuts for power users
- **Professional UI** - Clean, modern interface with subtle icons and smooth animations
- **Focus Management** - Arrow key navigation through checklist items
- **Smart Notifications** - Browser notifications for break reminders
- **Theme Consistency** - Professional color scheme and typography

### Testing & Automation

- **Test Automation Ready** - Comprehensive data-testid attributes for all components
- **Test Classes** - CSS classes for automated testing frameworks
- **Development Tools** - ESLint configuration and optimized build process

---

## Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayush-bhavsar/qa-checklist.git
   cd qa-checklist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

---

## Usage Guide

### Basic Workflow

1. **Select Category** - Choose from pre-built testing categories or create custom ones
2. **Navigate Tasks** - Use mouse clicks or keyboard arrows to move between tasks
3. **Mark Completion** - Click checkboxes or press Space/Enter to toggle task status
4. **Track Progress** - Monitor real-time progress bar and completion percentage
5. **Manage Content** - Add/edit/delete categories and tasks as needed

### Time Tracking

1. **Start Session** - Click Start or press `Ctrl+T` to begin timing
2. **Active Testing** - Timer runs automatically while session is active
3. **Take Breaks** - Receive notifications every 45 minutes for break reminders
4. **View Analytics** - Click Stats to see productivity metrics
5. **Stop/Reset** - Use Stop or Reset to control session timing

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate between tasks |
| `Space/Enter` | Toggle task completion |
| `Ctrl+T` | Start/Stop session timer |
| `Ctrl+Shift+T` | Show productivity stats |
| `Ctrl+B` | Take break (when reminded) |
| `Ctrl+N` | Add new task |
| `Ctrl+E` | Edit focused task |
| `Ctrl+D` | Delete focused task |
| `Ctrl+R` | Reset checklist |
| `Ctrl+S` | Export as CSV |
| `Ctrl+M` | Manage tasks |
| `Ctrl+Shift+M` | Manage categories |
| `Ctrl+/` | Show shortcuts help |
| `Esc` | Close panels/forms |

### Advanced Features

- **Custom Categories** - Create specialized testing checklists for your projects
- **Task Dependencies** - Organize tasks logically within categories
- **Progress Analytics** - Track completion rates and time efficiency
- **Data Export** - Generate CSV reports for documentation and reporting
- **Session Persistence** - Resume work exactly where you left off

---

## Project Structure

```
qa-checklist/
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico         # App icon
├── src/
│   ├── App.js              # Main application component
│   ├── data.js             # Default checklist data
│   ├── index.css           # Global styles and themes
│   └── index.js            # React application entry point
├── build/                  # Production build output
├── package.json            # Dependencies and scripts
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

### Key Components

- **`App.js`** - Main React component with state management, event handlers, and UI rendering
- **`data.js`** - Default testing categories and checklist items
- **`index.css`** - Professional styling with responsive design and animations

---

## Testing

### Automated Testing Setup

The application includes comprehensive test automation attributes for easy integration with testing frameworks.

#### Data Test IDs Available:

```javascript
// Main components
cy.get('[data-testid="qa-checklist-app"]')
cy.get('[data-testid="session-timer"]')
cy.get('[data-testid="category-selector"]')

// Interactive elements
cy.get('[data-testid="start-session-btn"]')
cy.get('[data-testid="checklist-item-0"]')
cy.get('[data-testid="manage-categories-btn"]')

// Dynamic elements
cy.get('[data-testid="category-btn-smoke"]')
cy.get('[data-testid="task-item-0"]')
cy.get('[data-testid="checklist-checkbox-0"]')
```

#### Example Test Cases:

```javascript
// Category selection test
cy.get('[data-testid="category-btn-smoke"]').click()
cy.get('[data-testid="checklist-section"]').should('be.visible')

// Task completion test
cy.get('[data-testid="checklist-checkbox-0"]').check()
cy.get('[data-testid="progress-fill"]').should('have.css', 'width', '20%')

// Time tracking test
cy.get('[data-testid="start-session-btn"]').click()
cy.get('[data-testid="timer-value"]').should('not.contain', '00:00:00')
```

### Running Tests

```bash
# Run test suite
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

---

## Customization

### Adding New Categories

1. Use the "Manage Categories" button
2. Click "Add New Category"
3. Enter category name and save
4. Add tasks to the new category

### Modifying Default Data

Edit `src/data.js` to customize default categories and tasks:

```javascript
export const defaultChecklistData = {
  yourCategory: {
    name: "Your Custom Category",
    items: [
      "Custom task 1",
      "Custom task 2",
      // Add more tasks...
    ]
  }
}
```

### Styling Customization

Modify `src/index.css` to customize:
- Color schemes and themes
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Automatic deployments on push

### Netlify

```bash
npm run build
# Upload build/ folder to Netlify
```

### Manual Deployment

```bash
npm run build
# Serve build/ folder with any static server
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow React best practices
- Add test IDs for new components
- Update documentation for new features
- Ensure responsive design
- Test across multiple browsers

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Icons and styling inspired by modern design systems
- Testing frameworks support for comprehensive QA workflows

---

<div align="center">

**Happy Testing!**

*Made with care for QA professionals*

[Back to Top](#qa-checklist-tool)

</div>
 
 