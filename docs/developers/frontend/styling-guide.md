# Frontend Styling Guide

This document outlines the styling approach, design system, and best practices for the Storage and Booking Application frontend.

## Table of Contents

- [Design System](#design-system)
- [CSS Architecture](#css-architecture)
- [Component Styling](#component-styling)
- [Theme System](#theme-system)
- [Typography](#typography)
- [Layout & Responsiveness](#layout--responsiveness)
- [Common UI Patterns](#common-ui-patterns)
- [Best Practices](#best-practices)

## Design System

Our application uses a consistent design system with predefined colors, typography, spacing, and components.

### Colors

The application uses a defined color palette with variables for different UI elements:

```css
:root {
  --background: white;
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: #2a2a2a;
  --primary-foreground: oklch(0.985 0 0);
  --secondary: #2f5D9E;
  --secondary-foreground: oklch(0.205 0 0);
  --highlight2: #3ec3ba;
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: #2f5D9E;
}
```

#### Core Colors

- **Primary**: `#2a2a2a` - Used for main UI elements, text, and primary actions
- **Secondary**: `#2f5D9E` (Purple) - Used for highlights, important UI elements
- **Highlight**: `#3ec3ba` (Teal) - Used for secondary highlights and accents
- **Destructive**: Used for error states, delete actions

#### Usage Guidelines

- Use semantic color variables (`--primary`, `--secondary`) rather than raw color values
- Maintain sufficient contrast ratios for accessibility (at least 4.5:1 for normal text)
- Limit color usage to the defined palette to maintain visual consistency

### Spacing

Use consistent spacing based on the Tailwind scale:

- `0.25rem` (4px): xs spacing (`p-1`, `m-1`)
- `0.5rem` (8px): sm spacing (`p-2`, `m-2`)
- `1rem` (16px): md spacing (`p-4`, `m-4`) - **Base spacing**
- `1.5rem` (24px): lg spacing (`p-6`, `m-6`)
- `2rem` (32px): xl spacing (`p-8`, `m-8`)
- `3rem` (48px): 2xl spacing (`p-12`, `m-12`)
- `4rem` (64px): 3xl spacing (`p-16`, `m-16`)

## CSS Architecture

The application uses a combination of:

1. **Tailwind CSS**: For utility-based styling
2. **Shadcn UI**: For component-level styling
3. **Custom CSS**: For global styles and variables

### Global Styles

Our global styles are defined in `src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Roboto+Slab:wght@100..900&display=swap");
@import "tailwindcss";
@import "tw-animate-css";

/* Theme variables */
:root {
  --main-font: "Lato", sans-serif;
  --heading-font: "Roboto Slab", serif;
  /* ...other variables */
}

/* Global styles */
@layer base {
  * {
    border: var(--border);
    outline: 50% solid var(--ring);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--main-font);
  }
  /* ...other global styles */
}
```

### Custom Component Classes

For common UI elements, we have predefined classes:

```css
.infoBtn {
  background-color: var(--background);
  color: var(--secondary);
  border-radius: 1rem;
  border: 1px solid var(--secondary);
  padding: 0.2rem 0.7rem;
  font-size: smaller;
}

.deleteBtn {
  background-color: var(--background);
  color: var(--color-red-500);
  border-radius: 1rem;
  border: 1px solid var(--color-red-500);
  padding: 0.2rem 0.7rem;
  font-size: smaller;
}

/* ...other custom button classes */
```

## Component Styling

### Shadcn UI Components

We use shadcn/ui for our core component library. These components are imported from `@/components/ui/` directory:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

All shadcn components follow a consistent design language and integrates with our theme system.

### Custom Components

For custom components, follow these guidelines:

1. Use Tailwind utility classes for styling
2. Group related utility classes together
3. Extract commonly used patterns into custom components

Example of a properly styled custom component:

```tsx
const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm flex items-center justify-between">
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="text-primary/25">{icon}</div>
    </div>
  );
};
```

## Theme System

The application will support light and dark modes through CSS variables:

<!-- TODO: add dark theme later -->

### Dark Mode

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  /* ...other dark mode variables */
}
```

### Implementing Theme-Aware Components

When creating components, use the theme CSS variables instead of hard-coded colors:

```tsx
// Good practice
<div className="bg-card text-card-foreground">
  Content goes here
</div>

// Avoid
<div className="bg-white text-black">
  Content goes here
</div>
```

## Typography

The application uses two primary fonts:

- **Lato**: (`--main-font`) - For body text and general UI
- **Roboto Slab**: (`--heading-font`) - For headings and important UI elements

### Font Sizes

Follow the Tailwind font size scale:

- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px) - **Base font size**
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)

### Typography Guidelines

```css
@layer base {
  h1,
  h2,
  h3,
  nav {
    font-family: var(--heading-font);
  }

  aside > nav {
    font-family: var(--main-font);
  }

  h2 {
    text-align: center;
    font-size: var(--text-lg);
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 0.5rem;
  }

  h3 {
    font-weight: bold;
    margin-bottom: 1rem;
  }
}
```

## Layout & Responsiveness

### Container Widths

Use Tailwind's container class with responsive modifiers:

```html
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Breakpoints

Follow these standard breakpoints:

- **sm**: 640px (Small devices)
- **md**: 768px (Medium devices)
- **lg**: 1024px (Large devices)
- **xl**: 1280px (Extra large devices)
- **2xl**: 1536px (2X large devices)

### Responsive Layout Patterns

1. **Mobile-first approach**: Design for mobile first, then enhance for larger screens
2. **Flex and Grid**: Use Flexbox and CSS Grid for responsive layouts
3. **Column stacking**: Stack columns vertically on mobile, horizontally on larger screens

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Main Content</div>
</div>
```

## Common UI Patterns

### Cards

```tsx
<div className="bg-card border rounded-lg p-6 shadow-sm">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p className="text-muted-foreground mt-2">Card content goes here.</p>
</div>
```

### Form Elements

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="Enter your email" />
  </div>
  <Button type="submit">Submit</Button>
</div>
```

### Toast Notifications

Custom toast styling:

```css
/* Custom Toast Styling */
.custom-toast {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  z-index: 1;
}

.custom-toast::after {
  content: "";
  position: absolute;
  border-radius: 0.75rem;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 0;
  background-color: #4caf50;
  animation: progressBar 3s linear forwards;
  animation-play-state: running;
  z-index: 0;
}

.custom-toast[data-type="error"]::after {
  background-color: #d32f2f;
}
```

### Button Styles

Use our predefined button styles:

```tsx
// Primary action button
<Button>Primary Action</Button>

// Secondary action button
<Button variant="outline">Secondary Action</Button>

// Info button
<button className="infoBtn">Info</button>

// Delete button
<button className="deleteBtn">Delete</button>

// Edit button
<button className="editBtn">Edit</button>

// Add button
<button className="addBtn">Add New</button>
```

## Best Practices

### 1. Use Tailwind Utility Classes

Prefer Tailwind utility classes for component-specific styling:

```tsx
// Good
<div className="p-4 bg-card rounded-lg shadow">

// Avoid custom CSS when equivalent Tailwind utilities exist
<div className="custom-card">
```

### 2. Maintain Consistent Spacing

Use consistent spacing values throughout the application:

```tsx
// Good - Using Tailwind's spacing scale
<div className="p-4 mt-6 mb-8">

// Avoid - Random spacing values
<div style={{ padding: '17px', marginTop: '23px' }}>
```

### 3. Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// Good - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Avoid - Desktop first then overriding for mobile
<div className="grid grid-cols-3 xs:grid-cols-1 sm:grid-cols-2">
```

### 4. Use Semantic HTML

Always use appropriate HTML elements for better accessibility:

```tsx
// Good
<button className="bg-primary text-white px-4 py-2 rounded">Click me</button>

// Avoid
<div className="bg-primary text-white px-4 py-2 rounded" onClick={handleClick}>Click me</div>
```

### 5. Follow Accessibility Guidelines

- Ensure sufficient color contrast (at least 4.5:1)
- Add appropriate ARIA attributes when needed
- Ensure keyboard navigation works correctly
- Test with screen readers

### 6. Organize Related Styles

Keep related styles together. For complex components, consider using Tailwind's `@apply` in a separate CSS file:

```css
/* In a component-specific CSS file */
.complex-component {
  @apply p-4 bg-card rounded-lg shadow flex items-center justify-between;
}
```

### 7. Consistent Naming Conventions

- Use kebab-case for custom CSS classes
- Use meaningful, descriptive names
- Avoid abbreviations unless they're very common
