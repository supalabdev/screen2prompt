export async function validateLicense(_key: string): Promise<{ valid: boolean; plan?: string }> {
  return { valid: true, plan: "pro" };
}

export function clearLicenseCache(): void {}
