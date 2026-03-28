import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface WarningBannerProps {
  message: string;
  cta?: { label: string; href: string };
}

export function WarningBanner({ message, cta }: WarningBannerProps) {
  return (
    <div className="flex items-start gap-3 border-b border-warning/20 bg-warning-bg px-4 py-3 text-sm text-warning">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {cta && (
        <Link href={cta.href} className="shrink-0 font-medium underline underline-offset-2 hover:opacity-80">
          {cta.label} →
        </Link>
      )}
    </div>
  );
}
