/**
 * Next.js instrumentation - runs once when the server starts.
 * Fixes MaxListenersExceededWarning from Prisma/Node.js beforeExit listeners.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(64);
  }
}
