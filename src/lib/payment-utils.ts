export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/[^\d]/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits.startsWith('254') ? digits : '';
  return /^254[17]\d{8}$/.test(normalized) ? normalized : null;
}

export function maskPhone(value: string) {
  return value.length >= 9 ? `${value.slice(0, 6)}•••${value.slice(-2)}` : value;
}
