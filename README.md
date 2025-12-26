# QA Checklist Tool

<div align="center">

[![React Version](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

A modern React application for managing QA testing checklists with productivity analytics, time tracking, and automation-friendly selectors.

[Live Demo](#) • [Documentation](#features) • [Testing](#testing)

</div>

---

## Table of Contents

- [Highlights](#highlights)
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

## Highlights

- Built with React 18 and responsive CSS for desktop and mobile workflows
- Persists user data, custom categories, and sessions using `localStorage`
- Rich time-tracking and productivity analytics tailored for QA teams
- Comprehensive `data-testid` hooks and testing-oriented class names
- Keyboard-driven controls and polished, professional UI system

---

## Features

### Core Functionality

- **Multiple Testing Categories**: Smoke, Regression, UI, Functional, and API templates ready to go
- **Custom Management**: Add, edit, and delete categories and tasks based on project needs
- **Real-time Progress**: Progress bars and completion percentages update as you work
- **Persistent Storage**: Automatically saves state locally for instant resume
- **Scheduled Runs**: Build recurring templates that auto-clone checklists with assigned due dates
- **Export Support**: Generate CSV exports for documentation and reporting
- **Responsive Design**: Layout adapts gracefully to desktops, tablets, and phones

### Time Tracking and Productivity

- **Dedicated Session Timer**: Start/stop/reset controls, persisted across reloads
- **Productivity Metrics**: Tracks completed tasks per hour, completion rates, and trends
- **Break Reminders**: Smart notifications prompt breaks at configurable intervals
- **Category Insights**: Surface time spent per category to guide QA prioritization
- **Session History**: Keeps context so you can pick up exactly where you left off

### User Experience Enhancements

- **Keyboard Shortcuts**: Navigate, manage tasks, and toggle timers without leaving the keyboard
- **Professional Visuals**: Iconography, typography, and spacing tuned for clarity
- **Focus Management**: Arrow-key navigation and focus preservation across interactions
- **Notifications**: Uses the browser Notifications API for hands-off reminders
- **Consistent Theming**: Unified color palette and motion to reinforce usability

### Testing and Automation

- **Automation Ready**: Consistent `data-testid` hooks across interactive elements
- **CSS Test Classes**: Dedicated selectors to support UI automation tools
- **Development Tooling**: ESLint, formatting conventions, and build scripts included

---

## Quick Start

### Prerequisites

- Node.js 16 or later
- npm (bundled with Node.js) or Yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ayush-bhavsar/qa-checklist.git
   cd qa-checklist
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm start
   ```
4. Visit the application
   ```text
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
```

The optimized output is written to the `build` directory.

---

## Usage Guide

### Typical Workflow

1. Select or create a testing category.
2. Navigate tasks with the keyboard or mouse.
3. Toggle task completion to update progress instantly.
4. Track progress and productivity using the stats panel.
5. Export results or reset when a cycle is complete.

### Time Tracking

1. Start a session via the on-screen control or `Ctrl+T`.
2. Continue testing; the timer and session state persist automatically.
3. Respond to break reminders to maintain sustainable pacing.
4. Review analytics to understand efficiency and throughput.
5. Stop or reset when the testing session concludes.

### Scheduled Templates and Runs

1. Open **Manage Schedules** to review recurring templates and upcoming runs.
2. Create a template by selecting a base category, cadence, and due date lead time.
3. Let the app auto-generate run-specific checklists ahead of each due date.
4. Mark runs complete (or reopen them) to keep due-date enforcement honest.
5. Archive runs once shipped to reduce clutter while preserving templates.

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `↑` / `↓` | Move between tasks |
| `Space` or `Enter` | Toggle task completion |
| `Ctrl+T` | Start or stop the session timer |
| `Ctrl+Shift+T` | Open productivity statistics |
| `Ctrl+B` | Toggle break acknowledgement |
| `Ctrl+N` | Create a new task |
| `Ctrl+E` | Edit the focused task |
| `Ctrl+D` | Delete the focused task |
| `Ctrl+R` | Reset the active checklist |
| `Ctrl+S` | Export current checklist as CSV |
| `Ctrl+M` | Open task management |
| `Ctrl+Shift+M` | Open category management |
| `Ctrl+/` | Display shortcut reference |
| `Esc` | Close open panels or dialogs |

---

## Project Structure

```
qa-checklist/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js
│   ├── data.js
│   ├── index.css
│   └── index.js
├── build/
├── package.json
├── README.md
└── .gitignore
```

### Key Modules

- `App.js`: Single-page React application that manages state, timers, persistence, and UI composition.
- `data.js`: Default category and task definitions used during initial load or reset.
- `index.css`: Global styling, layout rules, theming, and animation definitions.

---

## Testing

The UI exposes stable selectors to integrate with frameworks such as Cypress, Playwright, Selenium, and Testing Library.

### Available `data-testid` Hooks

```javascript
// Core containers
cy.get('[data-testid="qa-checklist-app"]')
cy.get('[data-testid="session-timer"]')
cy.get('[data-testid="category-selector"]')

// High-value controls
cy.get('[data-testid="start-session-btn"]')
cy.get('[data-testid="manage-categories-btn"]')
cy.get('[data-testid="manage-tasks-btn"]')

// Task elements
cy.get('[data-testid="task-item-0"]')
cy.get('[data-testid="checklist-checkbox-0"]')
cy.get('[data-testid="progress-fill"]')
```

### Example Automation Flow

```javascript
// Switch to the Smoke suite
cy.get('[data-testid="category-btn-smoke"]').click();
cy.get('[data-testid="checklist-section"]').should('be.visible');

// Complete the first task
cy.get('[data-testid="checklist-checkbox-0"]').check();
cy.get('[data-testid="progress-fill"]').should('not.have.css', 'width', '0%');

// Start timing and assert timer increments
cy.get('[data-testid="start-session-btn"]').click();
cy.wait(1100);
cy.get('[data-testid="timer-value"]').should('not.contain', '00:00:00');
```

### Running Tests

```bash
# Execute the test suite once
npm test

# Watch mode during development
npm test -- --watch

# Generate a coverage report
npm test -- --coverage
```

---

## Customization

### Add a Category via UI

1. Open the category management panel.
2. Select **Add New Category** and provide a name.
3. Save, then populate tasks through the task manager.

### Seed Custom Defaults

```javascript
export const defaultChecklistData = {
  myCategory: {
    name: "Release Certification",
    items: [
      "Validate release notes",
      "Run smoke test suite",
      "Audit analytics events"
    ]
  }
};
```

### Theme Adjustments

Edit `src/index.css` to tailor:

- Color tokens and typography
- Layout dimensions and spacing
- Animation timing and easing
- Responsive breakpoints

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari and Chrome on modern iOS and Android

---

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub.
2. Connect the project in the Vercel dashboard.
3. Deploy automatically on each push to the default branch.

### Netlify

```bash
npm run build
# Deploy the build/ directory via the Netlify UI or CLI
```

### Self-Hosted Static Server

```bash
npm run build
npm install -g serve
serve -s build
```

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-update`.
3. Commit with clear messages: `git commit -m "Describe your change"`.
4. Push and open a pull request describing your update.

### Development Guidelines

- Follow established React and hook patterns.
- Provide `data-testid` hooks for new interactive elements.
- Update documentation when adding or changing features.
- Validate responsive behavior across breakpoints.
- Run `npm test` before submitting pull requests.

---

## License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for full text.

---

## Acknowledgments

- Created with [Create React App](https://create-react-app.dev/).
- Iconography and layout influenced by contemporary design systems.
- Tested with modern JavaScript tooling and automation frameworks.

---

<div align="center">

**Happy Testing**

*Crafted to streamline QA workflows*

[Back to Top](#qa-checklist-tool)

</div>