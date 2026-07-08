'use client';

import { useRouter } from 'next/navigation';
import { buttonVariants, cn } from '@/design';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={cn(buttonVariants.ghost, 'px-4 py-2 text-body-sm')}>
      Log Out
    </button>
  );
}
