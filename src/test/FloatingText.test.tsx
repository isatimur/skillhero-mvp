import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FloatingText from '@/components/FloatingText';

describe('FloatingText', () => {
  it('renders the damage value', () => {
    render(<FloatingText value="+150" type="correct" />);
    expect(screen.getByText('+150')).toBeInTheDocument();
  });

  it('applies correct color class for crit', () => {
    const { container } = render(<FloatingText value="+300" type="crit" />);
    expect(container.firstChild).toHaveClass('text-cyan-400');
  });

  it('applies red for wrong answer', () => {
    const { container } = render(<FloatingText value="-80" type="wrong" />);
    expect(container.firstChild).toHaveClass('text-red-400');
  });
});
