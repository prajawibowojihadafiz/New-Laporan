export const APP_ID = 'Meraya.id';
export const APP_PASS = 'Meraya.id';
export const APP_PIN = '2901';

export const AUTH_CREDENTIALS = {
  id: APP_ID,
  pass: APP_PASS,
  pin: APP_PIN,
};

export const AUTH_STORAGE_KEY = 'photobooth_auth_session_v3';

/**
 * Validates the 3-layer security credentials: ID, Password, and 4-digit PIN
 */
export function verifyTripleCredentials(idInput: string, passInput: string, pinInput: string): boolean {
  if (!idInput || !passInput || !pinInput) return false;
  const isIdValid = idInput.trim().toLowerCase() === APP_ID.toLowerCase();
  const isPassValid = passInput === APP_PASS;
  const isPinValid = pinInput.trim() === APP_PIN;
  return isIdValid && isPassValid && isPinValid;
}

export function verifyPin(pin: string): boolean {
  if (!pin) return false;
  return pin.trim() === APP_PIN;
}

// Backward compatibility helper
export function verifyLoginCredentials(inputUser: string, inputPass: string, inputPin?: string): boolean {
  if (inputPin) {
    return verifyTripleCredentials(inputUser, inputPass, inputPin);
  }
  if (!inputUser || !inputPass) return false;
  return (
    inputUser.trim().toLowerCase() === APP_ID.toLowerCase() &&
    inputPass === APP_PASS
  );
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(`${AUTH_STORAGE_KEY}_username`);
    localStorage.removeItem('photobooth_auth_pin_v2');
    localStorage.removeItem('photobooth_auth_user_v1');
  } catch {}
}

export function setAuthSession(username: string = APP_ID): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(`${AUTH_STORAGE_KEY}_username`, username);
  } catch {}
}
