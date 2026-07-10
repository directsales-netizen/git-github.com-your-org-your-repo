import type { RequestKind, RequestPriority, RequestStatus } from '@/types/admin';

/** No server-only deps — safe to import from client components, unlike notifyRequest.ts. */
export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  general_inquiry: 'General Inquiry',
  appointment: 'Appointment Request',
  consultation: 'Consultation Request',
  support: 'Customer Support Request',
  live_chat: 'Live Chat Escalation',
  sales: 'Sales Inquiry',
  service: 'Service Request',
  quote: 'Quote Request',
  callback: 'Callback Request',
  order_question: 'Order-Related Question',
  technical_support: 'Technical Support Request',
  warranty_repair: 'Warranty or Repair Request',
  complaint: 'Customer Complaint',
  partnership: 'Partnership or Vendor Inquiry',
  return_request: 'Return Request',
  refund_request: 'Refund Request',
  other: 'Other Request',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};
