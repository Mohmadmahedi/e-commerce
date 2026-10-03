import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Standard RFC 6238 Time-based One-Time Password (TOTP) generator and verifier
 * using Node.js native crypto (zero external dependency).
 */
export class TotpUtil {
  /**
   * Generate a secure random Base32 secret key (160-bit)
   */
  static generateSecret(): string {
    const bytes = crypto.randomBytes(20);
    let secret = "";
    for (let i = 0; i < bytes.length; i++) {
      secret += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
    }
    return secret;
  }

  /**
   * Decode Base32 string to Buffer
   */
  private static base32ToBuffer(base32: string): Buffer {
    const clean = base32.toUpperCase().replace(/=+$/, "");
    let bits = "";
    for (let i = 0; i < clean.length; i++) {
      const val = BASE32_ALPHABET.indexOf(clean.charAt(i));
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, "0");
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return Buffer.from(bytes);
  }

  /**
   * Generate 6-digit TOTP code for a specific counter window
   */
  static generateToken(secret: string, counter: number): string {
    const key = this.base32ToBuffer(secret);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, "0");
  }

  /**
   * Verify TOTP code with ±1 window drift tolerance (30-second time step)
   */
  static verify(secret: string, token: string): boolean {
    if (!token || token.length !== 6) return false;
    const timeStep = 30; // 30 seconds
    const currentWindow = Math.floor(Date.now() / 1000 / timeStep);

    for (let drift = -1; drift <= 1; drift++) {
      const generated = this.generateToken(secret, currentWindow + drift);
      if (crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(token))) {
        return true;
      }
    }
    return false;
  }
}
