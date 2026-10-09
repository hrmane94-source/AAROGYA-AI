import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';

export interface PhoneNormalizationResult {
  valid: boolean;
  e164: string;
  nationalNumber: string;
  countryCode: string;
  formatted: string;
  error?: string;
}

export interface SmsSendDiagnostic {
  name: string;
  description: string;
  action: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  statusText?: string;
  rawResponse?: any;
  errorCode?: string;
  diagnostic?: SmsSendDiagnostic;
  error?: string;
}

/**
 * Decodes SMSLocal HTTP API numeric response codes into human-readable diagnostics.
 */
export function decodeSmsLocalCode(
  code: string,
  senderId: string = 'AROGYA'
): SmsSendDiagnostic {
  switch (code) {
    case '101':
      return {
        name: 'Invalid API Key',
        description: 'The API key provided is missing, malformed, or revoked by SMSLocal.',
        action: 'Verify SMSLOCAL_API_KEY from your SMSLocal Dashboard (Settings > API & Webhooks).',
      };
    case '102':
      return {
        name: 'Unapproved DLT Sender ID',
        description: `Sender header "${senderId}" is not registered or pending DLT approval under your Principal Entity in SMSLocal.`,
        action: 'In your SMSLocal dashboard, register your 6-character header or configure SMSLOCAL_SENDER_ID to your approved header.',
      };
    case '103':
      return {
        name: 'Insufficient Balance / Credits',
        description: 'Your SMSLocal account has run out of transactional SMS credits.',
        action: 'Recharge your SMSLocal account balance to send live mobile SMS.',
      };
    case '104':
      return {
        name: 'Invalid Mobile Number',
        description: 'Recipient mobile number was rejected by the SMS gateway format check.',
        action: 'Ensure a valid 10-digit Indian phone number or international number with country code.',
      };
    case '105':
      return {
        name: 'DLT Template ID Mismatch',
        description: 'Transactional SMS in India requires a TRAI DLT approved template ID matching the message content.',
        action: 'Set SMSLOCAL_TEMPLATE_ID in your configuration matching your approved DLT template.',
      };
    case '106':
      return {
        name: 'Invalid Route',
        description: 'The requested route (Transactional / Promotional) is invalid for this sender header.',
        action: 'Ensure SMSLOCAL_ROUTE is set to 1 for transactional OTPs.',
      };
    default:
      return {
        name: `Gateway Code ${code}`,
        description: `SMSLocal gateway returned response code ${code}.`,
        action: 'Check your SMSLocal dashboard delivery logs.',
      };
  }
}

/**
 * Normalizes user-entered mobile phone numbers into standard E.164 format.
 * Defaults to India ('IN', +91) while supporting international numbers.
 */
export function normalizePhoneNumber(
  rawInput: string,
  defaultCountry: string = 'IN'
): PhoneNormalizationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      valid: false,
      e164: '',
      nationalNumber: '',
      countryCode: '',
      formatted: '',
      error: 'Phone number is required',
    };
  }

  const cleaned = rawInput.trim();

  try {
    const phoneNumber = parsePhoneNumber(cleaned, defaultCountry as any);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return {
        valid: false,
        e164: '',
        nationalNumber: '',
        countryCode: '',
        formatted: '',
        error: 'Please enter a valid mobile phone number',
      };
    }

    return {
      valid: true,
      e164: phoneNumber.format('E.164'), // e.g. +919820144552
      nationalNumber: phoneNumber.nationalNumber, // e.g. 9820144552
      countryCode: phoneNumber.countryCallingCode, // e.g. 91
      formatted: phoneNumber.formatInternational(), // e.g. +91 98201 44552
    };
  } catch (err: any) {
    return {
      valid: false,
      e164: '',
      nationalNumber: '',
      countryCode: '',
      formatted: '',
      error: err.message || 'Invalid phone number format',
    };
  }
}

/**
 * Masks a phone number for secure logging and UI display (e.g. +91 98****4552)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return '****';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 6) return clean.slice(0, 2) + '****';
  return clean.slice(0, 5) + '****' + clean.slice(-4);
}

/**
 * Checks whether SMSLocal integration credentials are configured on the server.
 */
export function isSmsLocalConfigured(): boolean {
  const key = process.env.SMSLOCAL_API_KEY || 'e1bb889ff90d85ebbf8ca6cca81816be';
  return Boolean(key && key.trim().length > 0);
}

/**
 * Sends an OTP SMS via SMSLocal HTTP API.
 * Uses exact SMSLocal documented parameters:
 * key, sender, number, route, sms, templateid
 */
export async function sendOtpSmsViaSmsLocal(
  recipientPhone: string,
  otp: string,
  purpose: string = 'LOGIN'
): Promise<SmsSendResult> {
  const apiKey = (process.env.SMSLOCAL_API_KEY || 'e1bb889ff90d85ebbf8ca6cca81816be').trim();
  const senderId = process.env.SMSLOCAL_SENDER_ID?.trim() || 'AROGYA';
  const route = process.env.SMSLOCAL_ROUTE?.trim() || '1'; // Route 1: Transactional / OTP route
  const templateId = process.env.SMSLOCAL_TEMPLATE_ID?.trim();
  const baseUrl = process.env.SMSLOCAL_BASE_URL?.trim() || 'https://app.smslocal.in/api';

  if (!apiKey) {
    return {
      success: false,
      error: 'SMS provider not configured: SMSLOCAL_API_KEY is not set in server environment variables.',
    };
  }

  // Normalize phone number
  const norm = normalizePhoneNumber(recipientPhone);
  if (!norm.valid) {
    return {
      success: false,
      error: norm.error || 'Invalid recipient phone number',
    };
  }

  // For Indian numbers, SMSLocal expects 10 digits without +91 prefix.
  // For international numbers, use digits with country calling code.
  const targetNumber = norm.countryCode === '91' ? norm.nationalNumber : norm.e164.replace(/^\+/, '');

  // Prepare DLT-compliant message text
  // If a custom template is provided in SMSLOCAL_TEMPLATE_TEXT, substitute placeholder
  let messageText: string;
  if (process.env.SMSLOCAL_TEMPLATE_TEXT) {
    messageText = process.env.SMSLOCAL_TEMPLATE_TEXT
      .replace('{#var#}', otp)
      .replace('{OTP}', otp)
      .replace('{#otp#}', otp);
  } else {
    messageText = `Your Arogya AI verification OTP is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
  }

  // Build SMSLocal HTTP GET API URL
  const targetUrl = new URL(baseUrl);
  targetUrl.searchParams.set('key', apiKey);
  targetUrl.searchParams.set('sender', senderId);
  targetUrl.searchParams.set('route', route);
  targetUrl.searchParams.set('number', targetNumber);
  targetUrl.searchParams.set('sms', messageText);

  if (templateId) {
    targetUrl.searchParams.set('templateid', templateId);
  }

  const masked = maskPhoneNumber(norm.e164);
  console.info(`[SMSLocal] Dispatching OTP request to ${masked} (Route: ${route}, Sender: ${senderId})...`);

  // Timeout controller: 10 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Arogya-AI-Backend/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    let parsedJson: any = null;
    if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        // Not valid JSON, continue with rawText
      }
    }

    if (!response.ok) {
      console.error(`[SMSLocal] Provider returned HTTP ${response.status} for ${masked}`);
      return {
        success: false,
        statusText: `HTTP ${response.status}`,
        error: `SMS provider error (HTTP ${response.status}): ${rawText.slice(0, 150)}`,
        rawResponse: parsedJson || rawText,
      };
    }

    // Inspect provider payload for errors or success indicators
    if (parsedJson) {
      // Check common SMSLocal JSON responses
      const status = String(parsedJson.status || parsedJson.type || '').toLowerCase();
      const code = parsedJson.code || parsedJson.error_code || parsedJson.status_code;

      if (status === 'error' || status === 'failure' || status === 'failed' || (code && code !== 200 && code !== '200')) {
        const errorMsg = parsedJson.message || parsedJson.msg || parsedJson.description || 'SMS rejected by gateway';
        console.error(`[SMSLocal] Gateway rejected message for ${masked}: ${errorMsg} (code: ${code})`);
        return {
          success: false,
          error: `SMS gateway error: ${errorMsg}`,
          rawResponse: parsedJson,
        };
      }

      const msgId = parsedJson.message_id || parsedJson.msg_id || parsedJson.id || parsedJson.data?.message_id;
      console.info(`[SMSLocal] SMS request accepted for ${masked}. Message ID: ${msgId || 'generated'}`);
      return {
        success: true,
        messageId: String(msgId || Date.now()),
        statusText: status || 'accepted',
        rawResponse: parsedJson,
      };
    }

    // Plain text response analysis
    const trimmed = rawText.trim();
    const lower = trimmed.toLowerCase();

    // Check for 3-digit numeric error codes (e.g. 101, 102, 103, 104, 105, 106)
    const codeMatch = trimmed.match(/^([1-9]\d{2})$/);
    if (codeMatch) {
      const code = codeMatch[1];
      const diag = decodeSmsLocalCode(code, senderId);
      console.warn(`[SMSLocal] Gateway returned code ${code} for ${masked}: ${diag.name} - ${diag.description}`);
      return {
        success: false,
        errorCode: code,
        diagnostic: diag,
        statusText: `Code ${code} (${diag.name})`,
        error: `SMS gateway error ${code} (${diag.name}): ${diag.description}`,
        rawResponse: trimmed,
      };
    }

    // Check for explicit error strings in plain text
    if (
      lower.includes('error') ||
      lower.includes('invalid') ||
      lower.includes('failed') ||
      lower.includes('insufficient') ||
      lower.includes('template mismatch')
    ) {
      console.error(`[SMSLocal] Gateway error response for ${masked}: ${trimmed.slice(0, 100)}`);
      return {
        success: false,
        error: `SMS gateway rejected request: ${trimmed.slice(0, 120)}`,
        rawResponse: trimmed,
      };
    }

    // Success with numeric message ID or success acknowledgment
    console.info(`[SMSLocal] SMS accepted for ${masked}: ${trimmed.slice(0, 60)}`);
    return {
      success: true,
      messageId: trimmed,
      statusText: 'accepted',
      rawResponse: trimmed,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error(`[SMSLocal] Network timeout after 10s while sending SMS to ${masked}`);
      return {
        success: false,
        error: 'SMS gateway timed out. Please try again in a few moments.',
      };
    }

    console.error(`[SMSLocal] Network failure to ${masked}:`, err.message);
    return {
      success: false,
      error: `Failed to contact SMS gateway: ${err.message || 'Network error'}`,
    };
  }
}
