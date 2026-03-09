<<<<<<< HEAD
export default function DocumentsPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-5xl mb-4">📄</span>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Documents</h2>
            <p className="text-gray-400">Coming Soon</p>
        </div>
    )
=======
'use client';

import { useTranslations } from 'next-intl';
import ComingSoon from '@/components/ComingSoon';

export default function DocumentsPage() {
  const t = useTranslations('pages');
  return (
    <ComingSoon
      icon="📄"
      title={t('documents.title')}
      description={t('documents.desc')}
    />
  );
>>>>>>> payments
}
