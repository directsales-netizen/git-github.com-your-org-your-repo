import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import {
  getAllVisitorSessions,
  getOnlineVisitorCount,
  getAllChatbotEvents,
  getAllContactSubmissions,
} from '@/lib/admin/visitorAnalytics';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import VisitorAnalyticsClient from './VisitorAnalyticsClient';

export default async function VisitorAnalyticsPage() {
  // src/proxy.ts already guarantees a valid admin session before this page
  // renders; this route additionally requires SuperAdmin specifically —
  // regular admins/editors/viewers see a restricted notice, never the data.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Visitor Analytics" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Visitor analytics and intelligence data — IP, location, device, and session detail — is restricted to SuperAdmin accounts to protect visitor privacy. Contact a SuperAdmin if you need this data."
        />
      </div>
    );
  }

  const [sessions, onlineCount, chatbotEvents, contactSubmissions] = await Promise.all([
    getAllVisitorSessions(),
    getOnlineVisitorCount(),
    getAllChatbotEvents(),
    getAllContactSubmissions(),
  ]);

  await logActivity({ actor: session.sub, action: 'view', target: 'visitor analytics', detail: `${sessions.length} sessions` });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Visitor Analytics"
        description="Anonymous visitor intelligence — traffic, devices, locations, and chatbot activity. SuperAdmin only; every view is logged."
      />
      <VisitorAnalyticsClient
        initialSessions={sessions}
        initialOnlineCount={onlineCount}
        initialChatbotEvents={chatbotEvents}
        initialContactSubmissions={contactSubmissions}
      />
    </div>
  );
}
