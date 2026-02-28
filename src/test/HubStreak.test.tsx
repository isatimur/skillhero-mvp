import { render, screen } from '@testing-library/react';

it('shows streak when combo > 1', () => {
  const combo = 5;
  const { container } = render(
    <div>
      {combo > 1 && <span data-testid="streak">{combo}x Streak</span>}
    </div>
  );
  expect(screen.getByTestId('streak')).toHaveTextContent('5x Streak');
});

it('hides streak when combo is 0 or 1', () => {
  const combo = 1;
  const { container } = render(
    <div>
      {combo > 1 && <span data-testid="streak">{combo}x Streak</span>}
    </div>
  );
  expect(container.querySelector('[data-testid="streak"]')).toBeNull();
});
