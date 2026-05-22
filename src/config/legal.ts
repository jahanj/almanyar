/**
 * Versioning for the legal pages.
 *
 * Bump TERMS_VERSION whenever you materially change disclaimer text;
 * bump PRIVACY_VERSION whenever you materially change the privacy notice.
 *
 * The version is stored alongside each consent record so we can prove
 * which copy a user accepted at submission time (LEGAL-04).
 */
export const TERMS_VERSION = 1;
export const PRIVACY_VERSION = 1;

/**
 * Public-facing contact email for privacy/data-rights requests.
 *
 * Acked in PHASE-2-PLAN §5.E: changed from info@ to contact@. The owner
 * must confirm this alias is live in the mail server before /fa/privacy
 * is deployed — otherwise the privacy notice tells users an address that
 * silently bounces. Flagged in PHASE-2-REPORT.md.
 */
export const PRIVACY_CONTACT_EMAIL = 'contact@almanyar.com';
