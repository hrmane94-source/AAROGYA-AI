import crypto from 'crypto';
import { AuthUser, UserRole } from '../types';

export interface SessionData {
  sessionHash: string;
  user: AuthUser;
  createdAt: number;
  expiresAt: number;
  lastActiveAt: number;
  ip: string;
}

export interface RegistrationTokenData {
  phone: string;
  expiresAt: number;
}

export class SessionService {
  private static sessions = new Map<string, SessionData>();
  private static registrationTokens = new Map<string, RegistrationTokenData>();

  // 7 days session lifetime
  public static readonly SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
  // 15 minutes registration token lifetime
  public static readonly REGISTRATION_LIFETIME_MS = 15 * 60 * 1000;

  // Authoritative system user directory
  private static systemUsers: Map<string, AuthUser> = new Map([
    [
      '+919820188000',
      {
        id: 'usr-admin-default',
        name: 'Dr. Vikram Malhotra',
        email: 'admin.vikram@arogya.health',
        phone: '+91 98201 88000',
        role: 'admin',
        hospitalId: 'hosp-1',
        hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
        department: 'Hospital Administration & Chief Medical Office',
        designation: 'Chief Medical Officer & Administrator',
        badgeNumber: 'AROGYA-ADM-702',
        isLoggedIn: true,
      },
    ],
    [
      '+919811244331',
      {
        id: 'usr-staff-default',
        name: 'Anjali Nair',
        email: 'nurse.anjali@arogya.health',
        phone: '+91 98112 44331',
        role: 'hospital_staff',
        hospitalId: 'hosp-1',
        hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
        department: 'Central Outpatient Triage & Bed Management',
        designation: 'Senior Bed Triage Coordinator',
        badgeNumber: 'AROGYA-STF-304',
        isLoggedIn: true,
      },
    ],
    [
      '+919820144552',
      {
        id: 'usr-patient-default',
        name: 'Suhani Shambwani',
        email: 'suhani.shambwani@gmail.com',
        phone: '+91 98201 44552',
        role: 'patient',
        hospitalId: 'hosp-1',
        hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
        department: 'Outpatient Care',
        designation: 'Ayushman Registered Citizen',
        abhaId: '91-4421-8890-1234',
        isLoggedIn: true,
      },
    ],
    [
      '+919930211223',
      {
        id: 'usr-sysadmin-default',
        name: 'Rajesh Sharma',
        email: 'sysadmin.cluster@arogya.health',
        phone: '+91 99302 11223',
        role: 'sysadmin',
        hospitalId: 'hosp-1',
        hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
        department: 'Healthcare Systems & Infrastructure',
        designation: 'Healthcare Systems Administrator',
        badgeNumber: 'AROGYA-SYS-001',
        isLoggedIn: true,
      },
    ],
  ]);

  static {
    // Periodic sweep of expired sessions
    setInterval(() => {
      SessionService.cleanupExpired();
    }, 5 * 60 * 1000).unref();
  }

  /**
   * Hashes a session token for secure storage.
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Looks up a user by normalized phone number.
   * Checks Supabase profiles first (if client available), then authoritative registry.
   */
  public static async findUserByPhone(
    phone: string,
    supabaseClient?: any
  ): Promise<AuthUser | null> {
    const cleanDigits = phone.replace(/\D/g, '');

    // 1. Check Supabase profiles table if available
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .or(`phone.eq.${phone},phone.eq.+${cleanDigits},phone.eq.${cleanDigits.slice(-10)}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          const profile = data[0];
          return {
            id: profile.id,
            name: profile.full_name || profile.name || 'Registered User',
            email: profile.email || `${phone}@arogya.gov.in`,
            phone: profile.phone || phone,
            role: (profile.role as UserRole) || 'patient',
            hospitalId: profile.hospital_id || 'hosp-1',
            hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
            department: profile.designation ? 'Clinical Operations' : 'Patient Care',
            designation: profile.designation || (profile.role === 'patient' ? 'Ayushman Citizen' : 'Staff'),
            badgeNumber: profile.badge_number,
            abhaId: profile.abha_id,
            isLoggedIn: true,
          };
        }
      } catch (err) {
        console.warn('[SessionService] Supabase profile query failed, using authoritative registry:', err);
      }
    }

    // 2. Check authoritative system users map
    for (const [sysPhone, user] of this.systemUsers.entries()) {
      const sysDigits = sysPhone.replace(/\D/g, '');
      if (sysDigits === cleanDigits || sysDigits.slice(-10) === cleanDigits.slice(-10)) {
        return { ...user, isLoggedIn: true };
      }
    }

    return null;
  }

  /**
   * Creates a short-lived registration token for an unverified phone number.
   */
  public static createRegistrationToken(phone: string): string {
    const token = crypto.randomBytes(24).toString('hex');
    this.registrationTokens.set(token, {
      phone,
      expiresAt: Date.now() + this.REGISTRATION_LIFETIME_MS,
    });
    return token;
  }

  /**
   * Validates a registration token and retrieves the associated phone number.
   */
  public static validateRegistrationToken(token: string): string | null {
    const record = this.registrationTokens.get(token);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.registrationTokens.delete(token);
      return null;
    }

    // Consume single-use token
    this.registrationTokens.delete(token);
    return record.phone;
  }

  /**
   * Registers a new patient account. Unregistered users self-registering
   * via phone OTP can only be registered as 'patient'.
   */
  public static async registerPatient(
    phone: string,
    profileData: {
      fullName: string;
      email?: string;
      gender?: string;
      age?: number;
      abhaId?: string;
    },
    supabaseClient?: any
  ): Promise<AuthUser> {
    const userId = `usr-pat-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newUser: AuthUser = {
      id: userId,
      name: profileData.fullName.trim(),
      email: profileData.email?.trim() || `${phone.replace(/\D/g, '')}@arogya.gov.in`,
      phone: phone,
      role: 'patient', // Server strictly enforces patient role for self-registration
      hospitalId: 'hosp-1',
      hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
      department: 'Outpatient Care',
      designation: 'Ayushman Registered Citizen',
      abhaId: profileData.abhaId?.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      isLoggedIn: true,
    };

    // Store in persistent in-memory user registry
    this.systemUsers.set(phone, newUser);

    // Persist to Supabase if available
    if (supabaseClient) {
      try {
        await supabaseClient.from('profiles').insert({
          id: crypto.randomUUID(),
          full_name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: 'patient',
          abha_id: newUser.abhaId,
          is_active: true,
        });
      } catch (err) {
        console.warn('[SessionService] Supabase profile insert error (non-fatal):', err);
      }
    }

    return newUser;
  }

  /**
   * Establishes a server session and returns the plaintext session token
   * to be sent in an HTTP-only cookie.
   */
  public static createSession(user: AuthUser, ip: string = '127.0.0.1'): string {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = this.hashToken(rawToken);
    const now = Date.now();

    this.sessions.set(hash, {
      sessionHash: hash,
      user,
      createdAt: now,
      expiresAt: now + this.SESSION_LIFETIME_MS,
      lastActiveAt: now,
      ip,
    });

    return rawToken;
  }

  /**
   * Validates a session token and returns the authenticated user if valid.
   */
  public static validateSession(rawToken: string): AuthUser | null {
    if (!rawToken || typeof rawToken !== 'string') return null;

    const hash = this.hashToken(rawToken);
    const session = this.sessions.get(hash);

    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(hash);
      return null;
    }

    // Refresh last active timestamp
    session.lastActiveAt = now;
    return session.user;
  }

  /**
   * Destroys an active session.
   */
  public static destroySession(rawToken: string): boolean {
    if (!rawToken) return false;
    const hash = this.hashToken(rawToken);
    return this.sessions.delete(hash);
  }

  /**
   * Cleans up expired sessions and registration tokens.
   */
  public static cleanupExpired(): void {
    const now = Date.now();

    for (const [hash, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(hash);
      }
    }

    for (const [token, data] of this.registrationTokens.entries()) {
      if (now > data.expiresAt) {
        this.registrationTokens.delete(token);
      }
    }
  }

  /**
   * For testing and inspection only
   */
  public static _getSessionCount(): number {
    return this.sessions.size;
  }
}
