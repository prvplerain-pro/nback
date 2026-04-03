/** True if jméno nebo příjmení chybí — uživatel má doplnit po registraci e-mailem. */
export function needsProfileNames(p: {
  first_name?: string | null
  last_name?: string | null
} | null | undefined): boolean {
  if (!p) return true
  return !String(p.first_name ?? '').trim() || !String(p.last_name ?? '').trim()
}
