import { logger } from "./logger";

export interface BotVerificationResult {
  success: boolean;
  error?: string;
  hostname?: string;
  challengeTs?: string;
}

/**
 * Cloudflare Turnstile CAPTCHA & Bot Protection Validator
 */
export async function verifyTurnstileToken(
  token?: string | null,
  ip?: string
): Promise<BotVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // 1. Development and Test Bypass
  if (!secretKey || secretKey.startsWith("placeholder") || secretKey === "dummy_secret") {
    return { success: true };
  }

  // 2. Token presence check
  if (!token) {
    return {
      success: false,
      error: "Bot challenge token is required. Please complete verification.",
    };
  }

  // 3. Test token bypass for automated testing suites
  if (token === "test_mock_turnstile_pass" || token === "XXXX.DUMMY.TOKEN.XXXX") {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn({ data, ip }, "Cloudflare Turnstile verification rejected");
      return {
        success: false,
        error: "Bot protection challenge failed. Please refresh and try again.",
      };
    }

    return {
      success: true,
      hostname: data.hostname,
      challengeTs: data.challenge_ts,
    };
  } catch (err: any) {
    logger.error({ err }, "Turnstile verification service unreachable");
    // Fail closed in strict production mode, or log warning
    return {
      success: false,
      error: "Verification service temporarily unavailable.",
    };
  }
}
