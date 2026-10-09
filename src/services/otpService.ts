import crypto from 'crypto';

export interface OtpRecord {
  phone: string; // Normalized E.164
  hashedOtp: string;
  salt: string;
  purpose: string;
  createdAt: number;
  expiresAt: number; // 5 minutes
  attempts: number;
  maxAttempts: number;
  ip: string;
  lastRequestedAt: number;
}

export interface CanRequestOtpResult {
  allowed: boolean;
  reason?: string;
  cooldownSeconds?: number;
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: string;
  remainingAttempts?: number;
  phone?: string;
  purpose?: string;
}

export class OtpService {
  private static otpStore = new Map<string, OtpRecord>();
  private static phoneRequestHistory = new Map<string, { count: number; resetAt: number }>();
  private static ipRequestHistory = new Map<string, { count: number; resetAt: number }>();

  // Mutex locks to prevent concurrent race conditions per phone
  private static locks = new Set<string>();

  // Configuration constants
  public static readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  public static readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
  public static readonly MAX_ATTEMPTS = 5;
  public static readonly MAX_REQUESTS_PER_PHONE_HOUR = 5;
  public static readonly MAX_REQUESTS_PER_IP_HOUR = 15;

  static {
    // Automatic cleanup of expired OTPs and stale rate-limit history every 60 seconds
    setInterval(() => {
      OtpService.cleanupExpired();
    }, 60 * 1000).unref();
  }

  /**
   * Generates a cryptographically secure 6-digit random numeric OTP string.
   */
  public static generateCryptographicOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes an OTP with a unique cryptographic salt.
   */
  public static hashOtp(otp: string, salt: string): string {
    return crypto.createHash('sha256').update(salt + otp.trim()).digest('hex');
  }

  /**
   * Checks whether an OTP request is permitted under cooldown and rate-limit rules.
   */
  public static canRequestOtp(phone: string, ip: string = '127.0.0.1'): CanRequestOtpResult {
    const now = Date.now();

    // 1. Check existing active OTP cooldown (minimum 60 seconds)
    const existing = this.otpStore.get(phone);
    if (existing) {
      const elapsed = now - existing.lastRequestedAt;
      if (elapsed < this.RESEND_COOLDOWN_MS) {
        const remainingSec = Math.ceil((this.RESEND_COOLDOWN_MS - elapsed) / 1000);
        return {
          allowed: false,
          reason: `Please wait ${remainingSec} seconds before requesting a new OTP.`,
          cooldownSeconds: remainingSec,
        };
      }
    }

    // 2. Check per-phone hourly rate limit
    const phoneRecord = this.phoneRequestHistory.get(phone);
    if (phoneRecord) {
      if (now < phoneRecord.resetAt) {
        if (phoneRecord.count >= this.MAX_REQUESTS_PER_PHONE_HOUR) {
          const waitMinutes = Math.ceil((phoneRecord.resetAt - now) / (60 * 1000));
          return {
            allowed: false,
            reason: `Too many OTP requests for this phone number. Please try again in ${waitMinutes} minutes.`,
          };
        }
      } else {
        // Reset window
        this.phoneRequestHistory.set(phone, { count: 0, resetAt: now + 60 * 60 * 1000 });
      }
    } else {
      this.phoneRequestHistory.set(phone, { count: 0, resetAt: now + 60 * 60 * 1000 });
    }

    // 3. Check per-IP hourly rate limit
    const ipRecord = this.ipRequestHistory.get(ip);
    if (ipRecord) {
      if (now < ipRecord.resetAt) {
        if (ipRecord.count >= this.MAX_REQUESTS_PER_IP_HOUR) {
          const waitMinutes = Math.ceil((ipRecord.resetAt - now) / (60 * 1000));
          return {
            allowed: false,
            reason: `Too many OTP requests from your network. Please try again in ${waitMinutes} minutes.`,
          };
        }
      } else {
        this.ipRequestHistory.set(ip, { count: 0, resetAt: now + 60 * 60 * 1000 });
      }
    } else {
      this.ipRequestHistory.set(ip, { count: 0, resetAt: now + 60 * 60 * 1000 });
    }

    return { allowed: true };
  }

  /**
   * Stores a freshly generated OTP securely (salt + SHA-256 hash only).
   * Invalidates any previously active OTP for this phone.
   */
  public static storeOtp(
    phone: string,
    plaintextOtp: string,
    purpose: string = 'LOGIN',
    ip: string = '127.0.0.1'
  ): { expiresAt: number } {
    const now = Date.now();
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedOtp = this.hashOtp(plaintextOtp, salt);
    const expiresAt = now + this.OTP_EXPIRY_MS;

    // Overwrite / Invalidate any previous OTP for this phone
    this.otpStore.set(phone, {
      phone,
      hashedOtp,
      salt,
      purpose,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      ip,
      lastRequestedAt: now,
    });

    // Update hourly rate counters
    const phoneRecord = this.phoneRequestHistory.get(phone);
    if (phoneRecord) {
      phoneRecord.count += 1;
    }

    const ipRecord = this.ipRequestHistory.get(ip);
    if (ipRecord) {
      ipRecord.count += 1;
    }

    return { expiresAt };
  }

  /**
   * Atomically verifies an OTP candidate code against the stored salted hash.
   * Enforces attempt limits, expiry, and single-use invalidation.
   */
  public static verifyOtp(phone: string, candidateOtp: string): VerifyOtpResult {
    // Concurrency lock check
    if (this.locks.has(phone)) {
      return {
        valid: false,
        error: 'Verification in progress. Please retry.',
      };
    }

    this.locks.add(phone);
    try {
      const record = this.otpStore.get(phone);

      if (!record) {
        return {
          valid: false,
          error: 'No active OTP found for this number or OTP has expired. Please request a new OTP.',
        };
      }

      const now = Date.now();

      // Check Expiry (5 minutes)
      if (now > record.expiresAt) {
        this.otpStore.delete(phone);
        return {
          valid: false,
          error: 'OTP has expired. Please request a new verification code.',
        };
      }

      // Check Attempt Limit
      if (record.attempts >= record.maxAttempts) {
        this.otpStore.delete(phone);
        return {
          valid: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP.',
        };
      }

      // Increment attempt counter atomically
      record.attempts += 1;

      // Hash the candidate OTP with stored salt
      const candidateHash = this.hashOtp(candidateOtp, record.salt);

      // Constant-time comparison to prevent timing attacks
      const isMatch =
        candidateHash.length === record.hashedOtp.length &&
        crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(record.hashedOtp, 'hex'));

      if (!isMatch) {
        const remaining = record.maxAttempts - record.attempts;
        if (remaining <= 0) {
          this.otpStore.delete(phone);
          return {
            valid: false,
            error: 'Incorrect OTP. Maximum attempts exceeded. Please request a new code.',
            remainingAttempts: 0,
          };
        }

        return {
          valid: false,
          error: `Incorrect OTP code. ${remaining} attempt(s) remaining.`,
          remainingAttempts: remaining,
        };
      }

      // Successful verification: Invalidate immediately (single-use guarantee)
      const purpose = record.purpose;
      this.otpStore.delete(phone);

      return {
        valid: true,
        phone,
        purpose,
      };
    } finally {
      this.locks.delete(phone);
    }
  }

  /**
   * Explicitly invalidates any active OTP for a given phone number.
   */
  public static invalidateOtp(phone: string): void {
    this.otpStore.delete(phone);
  }

  /**
   * Cleans up expired OTP records and expired rate limit windows.
   */
  public static cleanupExpired(): void {
    const now = Date.now();

    for (const [phone, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(phone);
      }
    }

    for (const [phone, history] of this.phoneRequestHistory.entries()) {
      if (now > history.resetAt) {
        this.phoneRequestHistory.delete(phone);
      }
    }

    for (const [ip, history] of this.ipRequestHistory.entries()) {
      if (now > history.resetAt) {
        this.ipRequestHistory.delete(ip);
      }
    }
  }

  /**
   * For testing and inspection only
   */
  public static _getStoreSize(): number {
    return this.otpStore.size;
  }
}
