export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // Min 8 chars, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score++;
  if (password.match(/[a-z]/)) score++;
  else feedback.push('Add lowercase letters');

  if (password.match(/[A-Z]/)) score++;
  else feedback.push('Add uppercase letters');

  if (password.match(/\d/)) score++;
  else feedback.push('Add numbers');

  if (password.match(/[!@#$%^&*]/)) score++;
  else feedback.push('Add special characters for extra security');

  return { score: Math.min(score, 5), feedback };
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 255);
}
