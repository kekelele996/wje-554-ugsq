export const required = (value: string) => value.trim().length > 0;
export const phoneValid = (value: string) => /^1\d{10}$/.test(value) || /^\+?\d{7,15}$/.test(value);
