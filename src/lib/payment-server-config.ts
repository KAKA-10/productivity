import 'server-only';

export function canSimulatePayments(request: Request) {
  if (process.env.NODE_ENV === 'development') return true;
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.APP_ENV !== 'staging' ||
    process.env.PAYMENT_MODE !== 'mock' ||
    !process.env.STAGING_HOSTNAME
  ) {
    return false;
  }

  return new URL(request.url).hostname.toLowerCase() === process.env.STAGING_HOSTNAME.toLowerCase();
}
