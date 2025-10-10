# FairForm Design System

## Overview

The FairForm Design System provides a comprehensive set of reusable UI components, design tokens, and guidelines for building consistent, accessible, and beautiful user interfaces. Built on top of **shadcn/ui** and **Tailwind CSS**, it ensures design consistency across all FairForm features.

## Design Philosophy

- **Empathy over expertise** - Design for people unfamiliar with legal systems
- **Guided simplicity** - Every screen leads users toward understanding
- **Trust through transparency** - Calm, honest visuals build credibility
- **Mobile-first** - Responsive design from 360px up
- **Accessible by default** - WCAG 2.1 AA compliance is non-negotiable

## Design Tokens

### Colors

Our color system is built around the FairForm brand palette with semantic naming for consistency.

#### Primary Colors
- **Primary**: `hsl(202 100% 24%)` - Justice Blue (#004E7C)
- **Primary Hover**: `hsl(198 96% 18%)` - Deep Blue (#023E58)
- **Primary Foreground**: `hsl(0 0% 100%)` - White

#### Semantic Colors
- **Success**: `hsl(139 47% 44%)` - Balanced Green (#3BA55D)
- **Error**: `hsl(355 78% 56%)` - Legal Red (#E63946)
- **Accent**: `hsl(42 100% 70%)` - Empower Yellow (#FFD166)

#### Neutral Colors
- **Background**: `hsl(214 47% 97%)` - Soft Neutral (#F4F7FB)
- **Foreground**: `hsl(0 0% 9%)` - Dark Gray
- **Muted**: `hsl(220 13% 91%)` - Light Gray
- **Border**: `hsl(214 23% 88%)` - Border Gray

#### Usage Examples
```css
/* Primary button */
bg-primary text-primary-foreground

/* Success state */
text-success border-success

/* Error state */
text-error border-error

/* Muted text */
text-muted-foreground
```

### Typography

Built on the **Inter** font family for optimal readability and accessibility.

#### Font Scale
- **Headline (H1)**: `text-3xl font-bold` (32px, 700 weight)
- **Subhead (H2)**: `text-2xl font-semibold` (24px, 600 weight)
- **Body**: `text-base font-normal` (16px, 400 weight)
- **Caption/Label**: `text-sm font-medium` (14px, 500 weight)
- **Tooltip**: `text-xs font-normal` (13px, 400 weight)

#### Typography Classes
```css
/* Headings */
.heading-1 { @apply text-3xl font-bold leading-tight; }
.heading-2 { @apply text-2xl font-semibold leading-snug; }

/* Body text */
.body-text { @apply text-base font-normal leading-relaxed; }
.caption { @apply text-sm font-medium leading-normal; }
```

### Spacing

Consistent spacing scale based on 4px increments:

- **xs**: `0.5rem` (8px)
- **sm**: `1rem` (16px)
- **md**: `1.5rem` (24px)
- **lg**: `2rem` (32px)
- **xl**: `3rem` (48px)

### Border Radius

- **sm**: `calc(var(--radius) - 4px)` (8px)
- **md**: `calc(var(--radius) - 2px)` (10px)
- **lg**: `var(--radius)` (12px)

### Shadows

- **Card**: `0 10px 25px -12px rgba(2, 62, 88, 0.25)`
- **Default**: `0 1px 3px 0 rgba(0, 0, 0, 0.1)`

## Component Library

### Button

The Button component provides consistent styling and behavior across all interactive elements.

#### Variants
- **default**: Primary action button with blue background
- **destructive**: Destructive actions with red background
- **outline**: Secondary actions with border
- **secondary**: Neutral actions with gray background
- **ghost**: Subtle actions with transparent background
- **link**: Text-only actions styled as links

#### Sizes
- **default**: `h-11 px-6` (44px height)
- **sm**: `h-10 px-4` (40px height)
- **lg**: `h-12 px-8` (48px height)
- **icon**: `h-11 w-11` (44x44px square)

#### Usage Examples
```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button>Save Case</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Small size
<Button size="sm">Next Step</Button>

// Icon button
<Button size="icon" variant="ghost">
  <Settings className="h-4 w-4" />
</Button>
```

#### Accessibility Features
- Focus visible ring with accent color
- Proper ARIA attributes
- Keyboard navigation support
- Disabled state handling

### Card

The Card component provides consistent container styling for content sections.

#### Components
- **Card**: Main container
- **CardHeader**: Header section with title and description
- **CardTitle**: Card title styling
- **CardDescription**: Subtitle or description text
- **CardContent**: Main content area
- **CardFooter**: Footer section for actions

#### Usage Examples
```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Case Summary</CardTitle>
    <CardDescription>
      Review your case details and progress
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Case content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>Mark Complete</Button>
  </CardFooter>
</Card>
```

### Form Components

Comprehensive form components built on **react-hook-form** for validation and accessibility.

#### Components
- **Form**: Form provider wrapper
- **FormField**: Field controller with validation
- **FormItem**: Field container with spacing
- **FormLabel**: Accessible label with error states
- **FormControl**: Input wrapper with ARIA attributes
- **FormDescription**: Helper text
- **FormMessage**: Error message display

#### Usage Examples
```tsx
import { useForm } from "react-hook-form"
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const form = useForm()

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="Enter your email" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

#### Accessibility Features
- Automatic ARIA attributes (`aria-describedby`, `aria-invalid`)
- Error state management
- Screen reader support
- Keyboard navigation

## Layout Guidelines

### Grid System
- **Mobile**: 4-column grid
- **Tablet**: 8-column grid  
- **Desktop**: 12-column grid
- **Baseline**: 4px increments

### Container Widths
- **Max width**: 960px
- **Centered**: Auto margins
- **Responsive**: Full width on mobile

### Touch Targets
- **Minimum size**: 44x44px
- **Recommended**: 48x48px for primary actions

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Text**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio
- **Focus indicators**: High contrast outline

#### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order
- Focus indicators visible
- Escape key closes modals/tooltips

#### Screen Reader Support
- Semantic HTML elements
- ARIA labels and descriptions
- Form field associations
- Error message announcements

#### Focus Management
- Visible focus indicators
- Focus trap in modals
- Focus restoration after interactions

## Usage Guidelines

### Do's
- Use semantic HTML elements
- Provide alt text for images
- Use proper heading hierarchy
- Test with keyboard navigation
- Ensure color contrast compliance

### Don'ts
- Don't rely on color alone for information
- Don't use placeholder text as labels
- Don't create custom focus styles without testing
- Don't ignore error states
- Don't skip accessibility testing

## Development Workflow

### Adding New Components
1. Use shadcn/ui CLI: `npx shadcn@latest add [component]`
2. Customize with design tokens
3. Add accessibility features
4. Write tests
5. Update documentation

### Testing Components
- Unit tests with React Testing Library
- Accessibility tests with jest-axe
- Visual regression tests
- Keyboard navigation tests

### Design Token Updates
1. Update CSS variables in `app/globals.css`
2. Update Tailwind config if needed
3. Test across all components
4. Update documentation
5. Run accessibility audit

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-12 | Initial design system implementation |

---

*This design system is maintained by the FairForm development team. For questions or contributions, please refer to our development guidelines.*
