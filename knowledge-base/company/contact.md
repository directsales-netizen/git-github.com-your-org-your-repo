# Contact

Support email, phone, hours, and the shipping-origin address are admin-editable (Business Settings in the dashboard) and change over time — they are **not** hardcoded here to avoid ever going stale. The assistant receives the current values directly at request time (see `getBusinessSettings()` in `src/lib/admin/settings.ts`, injected into the system prompt by `src/lib/chat/generateAssistantReply.ts`), not from this file.

If you're reading this file directly (not via the assistant), check Business Settings in the admin dashboard, or the live `/support/contact` page, for current contact details.
