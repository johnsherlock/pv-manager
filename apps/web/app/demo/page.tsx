import type { Metadata } from 'next';
import { PublicDemoPage } from '@/src/public/PublicDemoPage';

export const metadata: Metadata = {
  title: 'Demo — Solar Tracker',
  description: 'A read-only public preview of Solar Tracker using sample data.',
};

export default function DemoPage() {
  return <PublicDemoPage />;
}
