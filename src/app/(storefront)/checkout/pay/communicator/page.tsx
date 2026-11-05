'use client';

import { useEffect } from 'react';

/**
 * Authorize.net's "IFrame Communicator" page — loaded inside the hidden
 * iframe their hosted payment page points its messages at
 * (hostedPaymentIFrameCommunicatorUrl, set when requesting the token in
 * src/lib/authorizenet/client.ts#getHostedPaymentPageToken). Authorize.net
 * navigates this page's hash (`#...`) to carry a JSON status payload; all
 * this page does is relay that hash up to the parent window via
 * postMessage, exactly the minimal shape documented in Authorize.net's own
 * sample apps. The parent page (../[token]/page.tsx) does the real work —
 * this one must stay inert.
 */
export default function PaymentCommunicatorPage() {
  useEffect(() => {
    function relay() {
      if (window.location.hash) {
        window.parent.postMessage(window.location.hash.substring(1), '*');
      }
    }
    relay();
    window.addEventListener('hashchange', relay);
    return () => window.removeEventListener('hashchange', relay);
  }, []);

  return null;
}
