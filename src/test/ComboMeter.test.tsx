import { render, screen } from '@testing-library/react';
import { ComboMeter } from '@/components/premium/ComboMeter';

it('mounts without crashing', () => {
  expect(() => render(<ComboMeter streak={0} multiplier={1} />)).not.toThrow();
});
it('shows streak count when active', () => {
  render(<ComboMeter streak={5} multiplier={2} />);
  expect(screen.getByText(/5/)).toBeInTheDocument();
});
