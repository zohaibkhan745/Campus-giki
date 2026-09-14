/**
 * Mandatory executive council roles required for an active student society to manage resources.
 */
export const MANDATORY_COUNCIL_ROLES = [
  'Vice President',
  'Event Coordinator',
  'General Secretary',
  'Treasurer',
  'Director Liaison',
] as const;

/**
 * Validates that an executive council JSON string contains all 5 mandatory positions.
 */
export function validateExecutiveCouncil(councilJson?: string | null): boolean {
  if (!councilJson) return false;
  try {
    const council: unknown = JSON.parse(councilJson);
    if (!Array.isArray(council)) return false;
    const existingRoles = council.map((member: unknown) => {
      if (typeof member === 'object' && member !== null && 'role' in member) {
        return (member as { role: unknown }).role;
      }
      return undefined;
    });
    return MANDATORY_COUNCIL_ROLES.every((role) => existingRoles.includes(role));
  } catch {
    return false;
  }
}
