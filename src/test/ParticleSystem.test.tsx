import { render } from '@testing-library/react';
import { ParticleSystem } from '@/components/premium/ParticleSystem';

it('mounts without crashing when inactive', () => {
  expect(() => render(<ParticleSystem type="levelup" active={false} />)).not.toThrow();
});
it('mounts without crashing when active', () => {
  expect(() => render(<ParticleSystem type="levelup" active={true} />)).not.toThrow();
});
