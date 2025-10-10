import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Variants', () => {
    it('renders default variant with correct classes', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button', { name: /default button/i })
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('renders destructive variant with correct classes', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: /delete/i })
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('renders outline variant with correct classes', () => {
      render(<Button variant="outline">Outline Button</Button>)
      const button = screen.getByRole('button', { name: /outline button/i })
      expect(button).toHaveClass('border', 'border-border', 'bg-background')
    })

    it('renders secondary variant with correct classes', () => {
      render(<Button variant="secondary">Secondary Button</Button>)
      const button = screen.getByRole('button', { name: /secondary button/i })
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('renders ghost variant with correct classes', () => {
      render(<Button variant="ghost">Ghost Button</Button>)
      const button = screen.getByRole('button', { name: /ghost button/i })
      expect(button).toHaveClass('bg-transparent', 'text-primary')
    })

    it('renders link variant with correct classes', () => {
      render(<Button variant="link">Link Button</Button>)
      const button = screen.getByRole('button', { name: /link button/i })
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('renders default size with correct classes', () => {
      render(<Button>Default Size</Button>)
      const button = screen.getByRole('button', { name: /default size/i })
      expect(button).toHaveClass('h-11', 'px-6')
    })

    it('renders small size with correct classes', () => {
      render(<Button size="sm">Small Button</Button>)
      const button = screen.getByRole('button', { name: /small button/i })
      expect(button).toHaveClass('h-10', 'px-4', 'text-sm')
    })

    it('renders large size with correct classes', () => {
      render(<Button size="lg">Large Button</Button>)
      const button = screen.getByRole('button', { name: /large button/i })
      expect(button).toHaveClass('h-12', 'px-8', 'text-base')
    })

    it('renders icon size with correct classes', () => {
      render(<Button size="icon">Icon</Button>)
      const button = screen.getByRole('button', { name: /icon/i })
      expect(button).toHaveClass('h-11', 'w-11')
    })
  })

  describe('States', () => {
    it('renders disabled state with correct classes', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: /disabled button/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-60')
    })

    it('handles click events when enabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      const button = screen.getByRole('button', { name: /clickable button/i })
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not handle click events when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: /disabled button/i })
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button>Focusable Button</Button>)
      const button = screen.getByRole('button', { name: /focusable button/i })
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-accent')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<Button>Keyboard Button</Button>)
      const button = screen.getByRole('button', { name: /keyboard button/i })
      
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('handles Enter key press', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Enter Button</Button>)
      const button = screen.getByRole('button', { name: /enter button/i })
      
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles Space key press', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Space Button</Button>)
      const button = screen.getByRole('button', { name: /space button/i })
      
      button.focus()
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('has proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      const button = screen.getByRole('button', { name: /custom label/i })
      expect(button).toHaveAttribute('aria-label', 'Custom label')
    })
  })

  describe('AsChild prop', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders as button when asChild is false', () => {
      render(<Button asChild={false}>Button</Button>)
      const button = screen.getByRole('button', { name: /button/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom Button</Button>)
      const button = screen.getByRole('button', { name: /custom button/i })
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-primary') // Default classes still present
    })
  })

  describe('Loading state simulation', () => {
    it('can be disabled to simulate loading state', () => {
      render(<Button disabled>Loading...</Button>)
      const button = screen.getByRole('button', { name: /loading/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-60')
    })
  })
})
