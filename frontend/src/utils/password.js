export const MIN_PASSWORD_LENGTH = 8;

// Returns an error message, or null when the password is acceptable.
export const validatePassword = (pw = '') => {
  if (pw.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must include at least one letter and one number';
  return null;
};

// 0 = empty, 1 = weak, 2 = good, 3 = strong
export const passwordStrength = (pw = '') => {
  if (!pw) return 0;
  if (validatePassword(pw)) return 1;
  return pw.length >= 12 && /[^A-Za-z0-9]/.test(pw) ? 3 : 2;
};
