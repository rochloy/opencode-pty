import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export function buildSessionNotFoundError(id: string): Error {
  return new Error(`PTY session '${id}' not found. Use pty_list to see active sessions.`)
}

/**
 * Load a .txt description file relative to the calling module.
 * Works at runtime in both Node.js and Bun.
 */
export function loadDescription(importMetaUrl: string, txtFileName: string): string {
  const __filename = fileURLToPath(importMetaUrl)
  const __dirname = dirname(__filename)
  return readFileSync(join(__dirname, txtFileName), 'utf-8')
}

/**
 * Helper to DRY up session-get/null-check logic
 * - manager: object with a getSession(id) or similar method
 * - id: session id
 * - fn: function called with session if found
 * - defaultValue: what to return if not found (default null)
 */
export function withSession<TSession, TResult>(
  manager: { getSession(id: string): TSession | null },
  id: string,
  fn: (session: TSession) => TResult,
  defaultValue: TResult
): TResult {
  const session = manager.getSession(id)
  if (!session) return defaultValue
  return fn(session)
}
