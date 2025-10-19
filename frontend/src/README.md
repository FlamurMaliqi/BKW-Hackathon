# BKW Engineering Design System

## Overview
This document defines the comprehensive design language system for the BKW Engineering AI Project Management application. The design system is based on the BKW Engineering brand identity and follows professional, clean design principles optimized for enterprise project management interfaces.

## 🎯 Design Philosophy

The BKW Engineering design system prioritizes:
- **Clarity**: Clear visual hierarchy and information architecture
- **Efficiency**: Streamlined workflows for project management tasks
- **Accessibility**: WCAG AA compliant design for inclusive user experience
- **Consistency**: Unified visual language across all components
- **Professionalism**: Enterprise-grade aesthetics reflecting BKW Engineering's brand values

## Brand Colors

### Primary Colors
- **BKW Blue**: `#004488` - Primary brand color from logo
- **White**: `#FFFFFF` - Secondary brand color from logo

### Extended Color Palette
- **Dark Blue**: `#1A2B4C` - Used for primary text and accents
- **Medium Blue**: `#1A5276` - Used for interactive elements and borders
- **Light Blue**: `#E3F2FD` - Used for subtle backgrounds and highlights

### Neutral Colors
- **Primary Text**: `#212529` - Main text color for headings and important content
- **Secondary Text**: `#495057` - Secondary text color for labels and descriptions
- **Muted Text**: `#6C757D` - Tertiary text color for less important information
- **Light Gray**: `#F8F9FA` - Background color for cards and sections
- **Border Gray**: `#E9ECEF` - Border color for subtle separations
- **Background**: `#FFFFFF` - Main background color

### Status Colors
- **Success**: `#28A745` - For positive states and confirmations
- **Warning**: `#FFC107` - For caution states and warnings
- **Error**: `#DC3545` - For error states and critical alerts
- **Info**: `#17A2B8` - For informational states and badges

## Typography

### Font Family
- **Primary**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
- **Monospace**: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

### Font Sizes
- **H1**: 28px (2.5rem) - Page titles
- **H2**: 24px (2rem) - Section titles
- **H3**: 20px (1.5rem) - Subsection titles
- **H4**: 18px (1.25rem) - Card titles
- **H5**: 16px (1rem) - Small headings
- **H6**: 14px (0.875rem) - Labels and captions
- **Body**: 16px (1rem) - Main content text
- **Small**: 14px (0.875rem) - Secondary text
- **Caption**: 12px (0.75rem) - Small labels and metadata

### Line Heights
- **Tight**: 1.2 - For headings
- **Normal**: 1.5 - For body text
- **Relaxed**: 1.6 - For long-form content

## Spacing System

### Base Unit
- **Base**: 8px (0.5rem)

### Spacing Scale
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 40px (2.5rem)
- **3xl**: 48px (3rem)

### Padding Guidelines
- **Card padding**: 24px (1.5rem)
- **Section padding**: 32px (2rem)
- **Button padding**: 10px 18px (0.625rem 1.125rem)
- **Input padding**: 12px 16px (0.75rem 1rem)

## Border Radius

### Corner Styles
- **Sharp**: 0px - For containers and main panels
- **Subtle**: 4px - For small elements and tags
- **Rounded**: 6px - For buttons and form elements
- **Medium**: 8px - For cards and sections

## Shadows

### Shadow Levels
- **Subtle**: `0 1px 3px rgba(0, 0, 0, 0.05)` - For cards and sections
- **Medium**: `0 2px 8px rgba(0, 0, 0, 0.1)` - For elevated elements
- **Strong**: `0 4px 16px rgba(0, 0, 0, 0.15)` - For modals and overlays

## Container Styles

### Main Containers
- **Background**: White (`#FFFFFF`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 8px
- **Padding**: 24px
- **Shadow**: Subtle shadow for depth

### Card Containers
- **Background**: White (`#FFFFFF`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 8px
- **Padding**: 24px
- **Margin**: 16px 0

### Section Containers
- **Background**: Light gray (`#F8F9FA`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 8px
- **Padding**: 24px

## Interactive Elements

### Buttons

#### Primary Button
- **Background**: BKW Blue (`#004488`)
- **Text**: White (`#FFFFFF`)
- **Border**: None
- **Border Radius**: 6px
- **Padding**: 10px 18px
- **Font Weight**: 600
- **Hover**: Darker blue (`#003366`)

#### Secondary Button
- **Background**: Light gray (`#F8F9FA`)
- **Text**: Dark gray (`#495057`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 6px
- **Padding**: 10px 18px
- **Font Weight**: 600
- **Hover**: Medium gray (`#E9ECEF`)

#### Outline Button
- **Background**: Transparent
- **Text**: BKW Blue (`#004488`)
- **Border**: 1px solid `#004488`
- **Border Radius**: 6px
- **Padding**: 10px 18px
- **Font Weight**: 600
- **Hover**: BKW Blue background with white text

### Form Elements

#### Input Fields
- **Background**: White (`#FFFFFF`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 6px
- **Padding**: 12px 16px
- **Font Size**: 16px
- **Focus**: Blue border (`#1A5276`) with subtle glow

#### Select Dropdowns
- **Background**: White (`#FFFFFF`)
- **Border**: 1px solid `#E9ECEF`
- **Border Radius**: 6px
- **Padding**: 8px 12px
- **Font Size**: 14px
- **Focus**: Blue border (`#1A5276`)

## Navigation

### Sidebar Navigation
- **Width**: 280px (desktop), 240px (tablet)
- **Background**: White (`#FFFFFF`)
- **Border**: Right border in BKW Blue (`#004488`)
- **Padding**: 24px
- **Shadow**: Subtle shadow for depth

### Header Navigation
- **Height**: 64px
- **Background**: White (`#FFFFFF`)
- **Border**: Bottom border in light gray (`#E9ECEF`)
- **Padding**: 0 24px
- **Shadow**: Subtle shadow for depth

## Status Indicators

### Badges
- **Success**: Green background (`#28A745`) with white text
- **Warning**: Yellow background (`#FFC107`) with dark text
- **Error**: Red background (`#DC3545`) with white text
- **Info**: Blue background (`#17A2B8`) with white text
- **Default**: Light gray background (`#E9ECEF`) with dark text

### Progress Bars
- **Background**: Light gray (`#E9ECEF`)
- **Fill**: BKW Blue (`#004488`)
- **Height**: 8px
- **Border Radius**: 4px

## Responsive Design

### Breakpoints
- **Mobile**: 0px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Adaptations
- Reduce padding and margins by 25%
- Stack elements vertically
- Use full-width buttons
- Increase touch targets to minimum 44px

## Accessibility

### Focus States
- **Outline**: 2px solid `#1A5276`
- **Offset**: 2px from element
- **Color**: High contrast blue

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements meet WCAG AA standards (3:1 ratio)

### Touch Targets
- Minimum 44px for interactive elements
- Adequate spacing between clickable elements

## 🧩 Component Guidelines

### Component Architecture
- **Atomic Design**: Build components from atoms to organisms
- **Reusability**: Create flexible, configurable components
- **Composition**: Combine smaller components to build complex interfaces
- **Props Interface**: Clear, well-documented component APIs

### Component Categories

#### Layout Components
- **Container**: Main content wrapper with consistent padding
- **Grid**: Responsive grid system for content organization
- **Stack**: Vertical and horizontal content stacking
- **Divider**: Visual separation between content sections

#### Navigation Components
- **Sidebar**: Main application navigation
- **Breadcrumb**: Hierarchical navigation trail
- **Tabs**: Content organization and switching
- **Pagination**: Data navigation controls

#### Form Components
- **Input**: Text input with validation states
- **Select**: Dropdown selection with search
- **Checkbox**: Boolean input with proper labeling
- **Radio**: Single selection from options
- **Button**: Interactive elements with multiple variants

#### Data Display Components
- **Card**: Content container with consistent styling
- **Table**: Data presentation with sorting and filtering
- **Badge**: Status and category indicators
- **Progress**: Task and loading progress indicators
- **Chart**: Data visualization components

#### Feedback Components
- **Alert**: System messages and notifications
- **Modal**: Overlay dialogs for focused interactions
- **Tooltip**: Contextual help and information
- **Loading**: Progress and loading state indicators

## 🛠️ Implementation Guidelines

### CSS Architecture
Use a modular CSS approach with the following structure:

```css
/* Global styles and CSS variables */
:root {
  --bkw-blue: #004488;
  --bkw-white: #FFFFFF;
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-muted: #6C757D;
  --bg-light: #F8F9FA;
  --border-color: #E9ECEF;
  --border-radius: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

/* Component-specific styles */
.component-name {
  /* Base styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

### Naming Conventions
- **CSS Classes**: BEM (Block Element Modifier) methodology
- **Components**: PascalCase (e.g., `ProjectCard`)
- **Files**: kebab-case (e.g., `project-card.css`)
- **Variables**: camelCase (e.g., `primaryColor`)

### Accessibility Standards
- **Semantic HTML**: Use appropriate HTML elements
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- **Focus Management**: Clear focus indicators and logical tab order

### Performance Optimization
- **CSS Optimization**: Minimize unused styles and use efficient selectors
- **Font Loading**: Use system fonts for optimal performance
- **Image Optimization**: Compress and optimize all images
- **Bundle Size**: Monitor and minimize CSS bundle size
- **Critical CSS**: Inline critical styles for faster rendering

## Examples

### Card Component
```css
.card {
  background: var(--bkw-white);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

### Button Component
```css
.btn-primary {
  background: var(--bkw-blue);
  color: var(--bkw-white);
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #003366;
}
```

## 📚 Usage Examples

### Creating a Project Card
```jsx
import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <div className="card project-card">
      <div className="project-card__header">
        <h3 className="project-card__title">{project.name}</h3>
        <span className={`badge badge--${project.status}`}>
          {project.status}
        </span>
      </div>
      <div className="project-card__content">
        <p className="project-card__description">{project.description}</p>
        <div className="project-card__meta">
          <span className="project-card__deadline">
            Deadline: {project.deadline}
          </span>
          <span className="project-card__priority">
            Priority: {project.priority}
          </span>
        </div>
      </div>
      <div className="project-card__actions">
        <button className="btn btn--primary" onClick={() => onEdit(project)}>
          Edit
        </button>
        <button className="btn btn--secondary" onClick={() => onDelete(project.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};
```

### Implementing a Form Input
```jsx
import React, { useState } from 'react';
import './FormInput.css';

const FormInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="form-input">
      <label className="form-input__label">
        {label}
        {required && <span className="form-input__required">*</span>}
      </label>
      <input
        type={type}
        className={`form-input__field ${error ? 'form-input__field--error' : ''} ${isFocused ? 'form-input__field--focused' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <span id={`${label}-error`} className="form-input__error">
          {error}
        </span>
      )}
    </div>
  );
};
```

## 🎨 Design Tokens

### Color Tokens
```css
:root {
  /* Brand Colors */
  --color-primary: #004488;
  --color-primary-dark: #003366;
  --color-primary-light: #1A5276;
  
  /* Neutral Colors */
  --color-text-primary: #212529;
  --color-text-secondary: #495057;
  --color-text-muted: #6C757D;
  --color-background: #FFFFFF;
  --color-background-light: #F8F9FA;
  --color-border: #E9ECEF;
  
  /* Status Colors */
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-error: #DC3545;
  --color-info: #17A2B8;
}
```

### Spacing Tokens
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 40px;
  --spacing-3xl: 48px;
}
```

### Typography Tokens
```css
:root {
  --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 28px;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## 🔄 Version Control

### Design System Updates
- **Major Changes**: Breaking changes that require component updates
- **Minor Changes**: New components or non-breaking enhancements
- **Patch Changes**: Bug fixes and small improvements

### Migration Guide
When updating the design system:
1. Review breaking changes in the changelog
2. Update component implementations
3. Test visual regression
4. Update documentation

This design system ensures consistency across the BKW Engineering application while maintaining a professional, clean appearance that reflects the brand identity and supports efficient project management workflows.
