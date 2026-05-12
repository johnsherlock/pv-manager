import { describe, expect, it } from 'vitest';
import {
  demoExclusions,
  demoIncludes,
  publicNavLinks,
  publicPrimaryCta,
  publicSecondaryCta,
} from '../content';

describe('public landing content', () => {
  it('keeps the demo and sign-in entry points stable', () => {
    expect(publicPrimaryCta).toEqual({
      label: 'View demo',
      href: '/demo',
    });

    expect(publicSecondaryCta).toEqual({
      label: 'Sign in for beta',
      href: '/sign-in',
    });
  });

  it('keeps public navigation anchored to the landing-page story sections', () => {
    expect(publicNavLinks.map((link) => link.href)).toEqual([
      '#story',
      '#product',
      '#beta',
    ]);
  });

  it('keeps the demo preview explicitly read-only', () => {
    expect(demoIncludes.length).toBeGreaterThan(0);
    expect(demoExclusions).toContain('No editing or setup flows');
  });
});
