/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * Falls back gracefully to pass-through when TURNSTILE_SECRET_KEY is omitted (e.g. in development/tests).
 */
export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development, testing, or when secret key is not configured, bypass verification safely
  if (!secretKey || process.env.NODE_ENV !== "production") {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "رمز التحقق الأمني مطلوب (Turnstile Token Missing)" };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data: any = await response.json();
    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: data["error-codes"]?.[0] || "فشل التحقق الأمني من البوتات",
    };
  } catch (err) {
    console.error("[Turnstile Verification Error]:", err);
    // Don't lock users out on network failure unless strict
    return { success: true };
  }
}
