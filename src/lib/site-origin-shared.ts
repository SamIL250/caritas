/** True for origins that should not be used for production redirects or email links. */
export function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost")
    );
  } catch {
    return /localhost|127\.0\.0\.1|\[::1\]/i.test(origin);
  }
}
