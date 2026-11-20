const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isLocalAuthBypassEnabled(host: string | null | undefined) {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.LOCAL_AUTH_BYPASS !== 'true' ||
    !host
  ) {
    return false;
  }

  try {
    return LOCAL_HOSTS.has(new URL(`http://${host}`).hostname.toLowerCase());
  } catch {
    return false;
  }
}
