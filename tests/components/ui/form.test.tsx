import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Test schema for validation
const testSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type TestFormData = z.infer<typeof testSchema>

// Test component that uses the form
const TestForm = ({ onSubmit }: { onSubmit: (data: TestFormData) => void }) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

describe('Form Components', () => {
  describe('FormField', () => {
    it('renders form field with label and input', () => {
      render(<TestForm onSubmit={vi.fn()} />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('displays form descriptions', () => {
      render(<TestForm onSubmit={vi.fn()} />)
      
      expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    it('handles form submission with valid data', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={handleSubmit} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      })
    })
  })

  describe('Form Validation', () => {
    it('shows email validation error', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      })
    })

    it('shows password length validation error', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'short')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('shows password confirmation error', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'different123')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when user corrects input', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      // Trigger validation error
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      })
      
      // Fix the error
      await user.clear(screen.getByLabelText(/email/i))
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('associates labels with form controls', () => {
      render(<TestForm onSubmit={vi.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      expect(emailInput).toHaveAttribute('id')
      expect(passwordInput).toHaveAttribute('id')
      expect(confirmPasswordInput).toHaveAttribute('id')
    })

    it('provides aria-describedby for form descriptions', () => {
      render(<TestForm onSubmit={vi.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const description = screen.getByText(/we'll never share your email/i)
      
      expect(emailInput).toHaveAttribute('aria-describedby')
      expect(description).toHaveAttribute('id')
    })

    it('provides aria-invalid when field has error', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('provides aria-describedby for error messages', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        const errorMessage = screen.getByText(/invalid email address/i)
        
        expect(emailInput).toHaveAttribute('aria-describedby')
        expect(errorMessage).toHaveAttribute('id')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /submit/i })
      
      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(confirmPasswordInput).toHaveFocus()
      
      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Form State Management', () => {
    it('maintains form state during user interaction', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Navigate away and back
      await user.tab()
      await user.tab()
      await user.tab()
      
      // Values should be preserved
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('handles form reset', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Reset form (this would typically be done programmatically)
      fireEvent.reset(emailInput.closest('form')!)
      
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })
  })

  describe('Error State Styling', () => {
    it('applies error styling to labels when field has error', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        const emailLabel = screen.getByText(/email/i)
        expect(emailLabel).toHaveClass('text-destructive')
      })
    })

    it('applies error styling to error messages', async () => {
      const user = userEvent.setup()
      
      render(<TestForm onSubmit={vi.fn()} />)
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.click(screen.getByRole('button', { name: /submit/i }))
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email address/i)
        expect(errorMessage).toHaveClass('text-destructive')
      })
    })
  })
})
