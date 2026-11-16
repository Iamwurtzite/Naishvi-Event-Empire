/**
 * NAISHVI EVENT EMPIRE - Global Website Configuration
 * Developer: Iamwurtzite (Rishik Upadhyay)
 * 
 * Central configuration for Google Sheets Webhook, Email Dispatcher,
 * and Cloud Gallery Image Storage.
 */

window.NC_CONFIG = window.NC_CONFIG || {};

// Central Google Sheets & Drive Webhook URL
// All website visitors will fetch live gallery images and send booking inquiries here.
window.NC_CONFIG.GOOGLE_SHEET_WEBHOOK = 
  (typeof localStorage !== 'undefined' && localStorage.getItem('nc_google_sheet_webhook')) ||
  '';

window.NC_CONFIG.ADMIN_EMAIL = 'naishvieventempire@gmail.com';
window.NC_CONFIG.CONTACT_PHONE = '+91 8279622416';
window.NC_CONFIG.COMPANY_NAME = 'NAISHVI EVENT EMPIRE';
