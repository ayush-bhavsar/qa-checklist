// data.js - Default checklist data for QA Checklist Tool

export const defaultChecklistData = {
  smoke: {
    name: "Smoke Testing",
    items: [
      "Application launches successfully",
      "Login works with valid credentials",
      "No critical errors on dashboard",
      "Main navigation menu loads correctly",
      "Basic user interface elements are visible",
      "Application responds to user interactions",
      "No broken links on homepage",
      "Core functionality is accessible",
      "Application closes gracefully",
      "No unexpected crashes during basic usage"
    ]
  },
  regression: {
    name: "Regression Testing",
    items: [
      "Previously fixed bugs remain resolved",
      "Existing features work as expected",
      "No new defects introduced",
      "Performance remains consistent",
      "Integration points function correctly",
      "Data integrity is maintained",
      "User workflows complete successfully",
      "Compatibility with supported browsers",
      "API endpoints return expected responses",
      "Database operations execute properly"
    ]
  },
  ui: {
    name: "UI Testing",
    items: [
      "Layout is consistent across devices",
      "Fonts and typography are readable",
      "Color scheme meets accessibility standards",
      "Images and media load properly",
      "Responsive design works on mobile",
      "Buttons and links are properly aligned",
      "Form elements are styled correctly",
      "Hover and focus states are visible",
      "Modal dialogs display correctly",
      "Page loading indicators work"
    ]
  },
  functional: {
    name: "Functional Testing",
    items: [
      "All user stories are implemented",
      "Business logic executes correctly",
      "Input validation works properly",
      "Error handling is appropriate",
      "Data processing is accurate",
      "User permissions are enforced",
      "Workflows complete end-to-end",
      "Calculations are correct",
      "File uploads/downloads work",
      "Search and filter functionality"
    ]
  },
  api: {
    name: "API Testing",
    items: [
      "Endpoints return correct status codes",
      "Request/response formats are valid",
      "Authentication mechanisms work",
      "Rate limiting is enforced",
      "Error responses are informative",
      "Data serialization is correct",
      "API documentation is accurate",
      "Versioning is handled properly",
      "Security headers are present",
      "Performance meets requirements"
    ]
  }
};