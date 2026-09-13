import { Resend } from "resend";

let client = null;

// Same "check once, lazily" shape as ensureWebPushConfigured in webpush.js —
// callers get a usable client only when RESEND_API_KEY is actually set, so
// the newsletter cron/admin endpoints can no-op with a clear message
// instead of throwing on every request when the key hasn't been added yet.
export function getResendClient() {
  if (client) return client;
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return null;
  client = new Resend(RESEND_API_KEY);
  return client;
}
