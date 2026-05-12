import type { Metadata } from 'next';
import { PublicLandingPage } from '@/src/public/PublicLandingPage';

export const metadata: Metadata = {
  title: 'Solar Tracker',
  description: 'A premium public preview of Solar Tracker for live solar, tariff-aware savings, and read-only demo access.',
};

export default function HomePage() {
  return <PublicLandingPage />;
}
