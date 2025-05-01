// File: backend/src/utils/validationUtils.ts
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidSshUrl(url: string): boolean {
    return url.startsWith('git@');
}

export function isValidSshKey(key: string): boolean {
    return key.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----') && key.endsWith('-----END OPENSSH PRIVATE KEY-----');
}
