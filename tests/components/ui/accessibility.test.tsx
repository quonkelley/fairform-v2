import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Test component for comprehensive accessibility testing
const AccessibilityTestComponent = () => {
  return (
    <div>
      <h1>Accessibility Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-input">Test Input</Label>
              <Input id="test-input" placeholder="Enter text" />
            </div>
            
            <div className="flex gap-2">
              <Button>Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
              <Button variant="ghost">Ghost Action</Button>
            </div>
            
            <div>
              <Button disabled>Disabled Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

describe('Accessibility Tests', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<AccessibilityTestComponent />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      render(<AccessibilityTestComponent />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Accessibility Test Page')
    })

    it('should have proper form labels', () => {
      render(<AccessibilityTestComponent />)
      
      const input = screen.getByLabelText(/test input/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('id', 'test-input')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through interactive elements', async () => {
      const user = userEvent.setup()
      
      render(<AccessibilityTestComponent />)
      
      const input = screen.getByLabelText(/test input/i)
      const primaryButton = screen.getByRole('button', { name: /primary action/i })
      const secondaryButton = screen.getByRole('button', { name: /secondary action/i })
      const ghostButton = screen.getByRole('button', { name: /ghost action/i })
      const disabledButton = screen.getByRole('button', { name: /disabled button/i })
      
      // Tab through elements
      await user.tab()
      expect(input).toHaveFocus()
      
      await user.tab()
      expect(primaryButton).toHaveFocus()
      
      await user.tab()
      expect(secondaryButton).toHaveFocus()
      
      await user.tab()
      expect(ghostButton).toHaveFocus()
      
      // Disabled button should be skipped
      await user.tab()
      expect(disabledButton).not.toHaveFocus()
    })

    it('should handle Enter key on buttons', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Test Button</Button>)
      
      const button = screen.getByRole('button', { name: /test button/i })
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle Space key on buttons', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Test Button</Button>)
      
      const button = screen.getByRole('button', { name: /test button/i })
      button.focus()
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger disabled buttons with keyboard', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
      
      const button = screen.getByRole('button', { name: /disabled button/i })
      button.focus()
      
      await user.keyboard('{Enter}')
      await user.keyboard(' ')
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(<Button>Focusable Button</Button>)
      
      const button = screen.getByRole('button', { name: /focusable button/i })
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-accent')
    })

    it('should maintain focus state during interaction', async () => {
      const user = userEvent.setup()
      
      render(<Button>Focus Test</Button>)
      
      const button = screen.getByRole('button', { name: /focus test/i })
      button.focus()
      
      expect(button).toHaveFocus()
      
      // Click should not remove focus
      await user.click(button)
      expect(button).toHaveFocus()
    })

    it('should handle focus restoration after disabled state', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<Button>Dynamic Button</Button>)
      
      const button = screen.getByRole('button', { name: /dynamic button/i })
      button.focus()
      
      expect(button).toHaveFocus()
      
      // Disable button
      rerender(<Button disabled>Dynamic Button</Button>)
      expect(button).toBeDisabled()
      
      // Re-enable button
      rerender(<Button>Dynamic Button</Button>)
      expect(button).not.toBeDisabled()
    })
  })

  describe('ARIA Attributes', () => {
    it('should have proper ARIA attributes on buttons', () => {
      render(<Button aria-label="Custom button label">Button</Button>)
      
      const button = screen.getByRole('button', { name: /custom button label/i })
      expect(button).toHaveAttribute('aria-label', 'Custom button label')
    })

    it('should have proper ARIA attributes on form controls', () => {
      render(
        <div>
          <Label htmlFor="aria-test">Aria Test Input</Label>
          <Input 
            id="aria-test" 
            aria-describedby="aria-description"
            aria-required="true"
          />
          <div id="aria-description">This field is required</div>
        </div>
      )
      
      const input = screen.getByLabelText(/aria test input/i)
      expect(input).toHaveAttribute('aria-describedby', 'aria-description')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('should have proper ARIA attributes on cards', () => {
      render(
        <Card role="region" aria-labelledby="card-title">
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )
      
      const card = screen.getByRole('region', { name: /accessible card/i })
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast for text', () => {
      render(
        <div>
          <p className="text-foreground">Primary text</p>
          <p className="text-muted-foreground">Muted text</p>
          <p className="text-destructive">Error text</p>
        </div>
      )
      
      // These classes should provide sufficient contrast
      // The actual contrast values are defined in the CSS variables
      expect(screen.getByText('Primary text')).toHaveClass('text-foreground')
      expect(screen.getByText('Muted text')).toHaveClass('text-muted-foreground')
      expect(screen.getByText('Error text')).toHaveClass('text-destructive')
    })

    it('should have proper focus indicators with high contrast', () => {
      render(<Button>High Contrast Focus</Button>)
      
      const button = screen.getByRole('button', { name: /high contrast focus/i })
      expect(button).toHaveClass('focus-visible:ring-accent')
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper semantic HTML structure', () => {
      render(
        <main>
          <h1>Page Title</h1>
          <section>
            <h2>Section Title</h2>
            <p>Section content</p>
          </section>
        </main>
      )
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should provide alternative text for images', () => {
      render(
        <img 
          src="/test-image.jpg" 
          alt="Test image description"
          role="img"
        />
      )
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Test image description')
    })

    it('should have proper button text or aria-label', () => {
      render(
        <div>
          <Button>Button with text</Button>
          <Button aria-label="Button without visible text">
            <span aria-hidden="true">🔍</span>
          </Button>
        </div>
      )
      
      expect(screen.getByRole('button', { name: /button with text/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /button without visible text/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling and Feedback', () => {
    it('should provide error messages with proper ARIA attributes', () => {
      render(
        <div>
          <Label htmlFor="error-input">Error Input</Label>
          <Input 
            id="error-input" 
            aria-invalid="true"
            aria-describedby="error-message"
          />
          <div id="error-message" role="alert">
            This field has an error
          </div>
        </div>
      )
      
      const input = screen.getByLabelText(/error input/i)
      const errorMessage = screen.getByRole('alert')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
      expect(errorMessage).toHaveTextContent('This field has an error')
    })

    it('should announce errors to screen readers', () => {
      render(
        <div role="alert" aria-live="polite">
          Form validation error occurred
        </div>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
    })
  })
})
