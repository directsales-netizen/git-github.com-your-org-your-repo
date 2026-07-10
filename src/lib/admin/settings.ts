import type { BusinessSettings } from '@/types/admin';
import { globalBox } from '@/lib/globalStore';

const settingsBox = globalBox('businessSettings', (): BusinessSettings => ({
  businessName: 'Premium TechNoir',
  supportEmail: 'directsales@premiumtechnoir.org',
  supportPhone: '(786) 984-2420',
  businessHours: 'Mon–Fri 9am–7pm ET, Sat 10am–4pm ET',
  address: '400 Congress Ave, Austin, TX 78701',
  currency: 'USD',
  taxRatePercent: 8.25,
  maintenanceMode: false,
  requireAccountForCheckout: false,
  ordersPaused: false,
  inquiryOnlyMode: true,
}));

export async function getBusinessSettings(): Promise<BusinessSettings> {
  return settingsBox.current;
}

export async function updateBusinessSettings(patch: Partial<BusinessSettings>): Promise<BusinessSettings> {
  settingsBox.current = { ...settingsBox.current, ...patch };
  return settingsBox.current;
}
