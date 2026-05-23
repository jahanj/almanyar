/**
 * Single source of truth for contact entry points (WhatsApp, email, city).
 *
 * Used by the floating WhatsApp button (TRUST-08), footer contact column
 * (TRUST-03), about page CTAs (TRUST-01), and the cinematic hero. Keeping
 * the URL + prefilled message in one place means a future phone-number
 * change touches one file.
 */

export const WHATSAPP_PHONE = '+90 506 770 8295';
export const WHATSAPP_PHONE_E164 = '905067708295'; // wa.me requires no '+' / spaces

/** Prefilled message that opens in the user's WhatsApp client. */
export const WHATSAPP_PREFILLED_FA =
  'سلام، می‌خواهم در مورد مهاجرت تحصیلی به آلمان مشاوره بگیرم';

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encodeURIComponent(WHATSAPP_PREFILLED_FA)}`;

export const CONTACT_EMAIL = 'contact@almanyar.com';
export const CONTACT_EMAIL_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const OFFICE_CITY_FA = 'استانبول، ترکیه';
