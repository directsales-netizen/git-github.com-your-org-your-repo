import { getAllAppointments } from '@/lib/chat/appointments';
import PageHeader from '@/components/admin/PageHeader';
import AppointmentsClient from './AppointmentsClient';

export default async function AdminAppointmentsPage() {
  const appointments = await getAllAppointments();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Appointments" description="Repairs, consultations, and callback requests." />
      <AppointmentsClient initialAppointments={appointments} />
    </div>
  );
}
