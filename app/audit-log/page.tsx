
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import ComingSoon from '@/components/ComingSoon';

export default function AuditLogPage() {
  const t = useTranslations('pages');
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/auth/login'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'admin') {
      toast.error('Audit Log is only available to administrators.');
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <ComingSoon
      icon="📜"
      title={t('auditLog.title')}
      description={t('auditLog.desc')}
    />
  );
}
