'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import ComingSoon from '@/components/ComingSoon';

export default function DocumentsPage() {
  const t = useTranslations('pages');
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/auth/login'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'admin') {
      toast.error('Documents is only available to administrators.');
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <ComingSoon
      icon="📄"
      title={t('documents.title')}
      description={t('documents.desc')}
    />
  );
}
