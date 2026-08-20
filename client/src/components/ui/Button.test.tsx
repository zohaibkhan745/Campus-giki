import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-vast-ink'); // primary variant class
  });

  it('renders different variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-red-600');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('renders left and right icons', () => {
    const LeftIcon = <span data-testid="left-icon" />;
    const RightIcon = <span data-testid="right-icon" />;
    
    render(
      <Button leftIcon={LeftIcon} rightIcon={RightIcon}>
        With Icons
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
