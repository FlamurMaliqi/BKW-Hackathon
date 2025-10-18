# BKW Engineering - Design Language System

## Overview
This document defines the global design language for the BKW Engineering AI Project Management application. The design system is based on the BKW Engineering brand identity and follows professional, clean design principles similar to modern medical applications.

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

## Implementation Guidelines

### CSS Variables
Use CSS custom properties for consistent theming:

```css
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
```

### Component Structure
- Use semantic HTML elements
- Implement proper ARIA labels
- Follow BEM naming convention for CSS classes
- Maintain consistent spacing using the defined scale

### Performance
- Use system fonts for optimal loading
- Minimize custom CSS properties
- Optimize images and icons
- Use CSS Grid and Flexbox for layouts

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

This design system ensures consistency across the BKW Engineering application while maintaining a professional, clean appearance that reflects the brand identity.
