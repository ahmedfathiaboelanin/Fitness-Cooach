/**
 * Client-side password hashing (SHA-256 hex).
 * Matches `encode(digest(..., 'sha256'), 'hex')` in Postgres/pgcrypto,
 * so the server can compare hashes without ever seeing plaintext.
 */

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256Hex(text) {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Secure crypto unavailable — open the site over https or localhost.')
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(String(text ?? '')))
  return toHex(digest)
}

/** Basic new-password policy shared by the dashboard form + login. */
export function passwordError(pw, min = 6) {
  if (!pw) return 'Password required'
  if (String(pw).length < min) return `At least ${min} characters`
  return null
}
