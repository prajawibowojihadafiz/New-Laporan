export const AUTH_CREDENTIALS = {
  id: 'Meraya.id',
  pass: 'Meraya.id',
};

export const AUTH_STORAGE_KEY = 'photobooth_auth_user_v1';

export function verifyLoginCredentials(inputUser: string, inputPass: string): boolean {
  if (!inputUser || !inputPass) return false;
  return (
    inputUser.trim().toLowerCase() === AUTH_CREDENTIALS.id.toLowerCase() &&
    inputPass === AUTH_CREDENTIALS.pass
  );
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(`${AUTH_STORAGE_KEY}_username`);
  } catch {}
}

export function setAuthSession(username: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(`${AUTH_STORAGE_KEY}_username`, username);
  } catch {}
}

