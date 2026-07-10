import { cookies } from 'next/headers';
import { getAdminSession } from '@/lib/admin/getSession';
import { ADMIN_REMEMBER_COOKIE, verifyRememberToken } from '@/lib/admin/rememberToken';
import { getSessionsForEmail } from '@/lib/admin/sessionRegistry';
import PageHeader from '@/components/admin/PageHeader';
import SessionsClient from './SessionsClient';

export default async function AdminSessionsPage() {
  const session = await getAdminSession();
  const rememberToken = (await cookies()).get(ADMIN_REMEMBER_COOKIE)?.value;
  const currentPayload = await verifyRememberToken(rememberToken);

  const sessions = session
    ? getSessionsForEmail(session.sub).map((record) => ({ ...record, isCurrent: record.sid === currentPayload?.sid }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Active Sessions"
        description="Devices where you're remembered via “Keep me logged in.” Only devices you checked that box on appear here — resets on server restart."
      />
      <SessionsClient sessions={sessions} />
    </div>
  );
}
