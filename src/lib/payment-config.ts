export function canSimulatePaymentsInUi() {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'staging';
}

export function isStagingPreview() {
  return process.env.NEXT_PUBLIC_APP_ENV === 'staging';
}
