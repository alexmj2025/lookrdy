export const passwordResetPath = "/account/reset-password";

export function accountReturnPath(value: string | null): string {
  return value && /^(?:\/create|\/wardrobe|\/looks(?:\/look-\d+)?|\/saved)$/.test(value) ? value : "/saved";
}
